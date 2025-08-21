import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BookingPayment } from '../../database/entity/booking-payment.entity';
import { Booking } from '../../database/entity/booking.entity';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';

export interface DashboardStats {
  totalRevenue: number;
  newCustomers: number;
  totalBookings: number;
  growthRate: number;
  revenueChange: number;
  customerChange: number;
  bookingChange: number;
}

export interface ChartData {
  date: string;
  leads: number;
  bookings: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
  ) {}

  async getDashboardStats(organizationId: string): Promise<DashboardStats> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // Current month stats
    const currentMonthRevenue = await this.getRevenueForPeriod(
      organizationId,
      lastMonth,
      now,
    );
    const currentMonthCustomers = await this.getNewCustomersForPeriod(
      organizationId,
      lastMonth,
      now,
    );
    const currentMonthBookings = await this.getBookingsForPeriod(
      organizationId,
      lastMonth,
      now,
    );

    // Previous month stats
    const previousMonthRevenue = await this.getRevenueForPeriod(
      organizationId,
      twoMonthsAgo,
      lastMonth,
    );
    const previousMonthCustomers = await this.getNewCustomersForPeriod(
      organizationId,
      twoMonthsAgo,
      lastMonth,
    );
    const previousMonthBookings = await this.getBookingsForPeriod(
      organizationId,
      twoMonthsAgo,
      lastMonth,
    );

    // Total stats
    const totalRevenue = await this.getTotalRevenue(organizationId);
    const totalBookings = await this.getTotalBookings(organizationId);
    const totalCustomers = await this.getTotalCustomers(organizationId);

    // Calculate changes
    const revenueChange = this.calculatePercentageChange(
      previousMonthRevenue,
      currentMonthRevenue,
    );
    const customerChange = this.calculatePercentageChange(
      previousMonthCustomers,
      currentMonthCustomers,
    );
    const bookingChange = this.calculatePercentageChange(
      previousMonthBookings,
      currentMonthBookings,
    );

    // Calculate overall growth rate (average of all metrics)
    const growthRate = (revenueChange + customerChange + bookingChange) / 3;

    return {
      totalRevenue,
      newCustomers: currentMonthCustomers,
      totalBookings,
      growthRate: Math.round(growthRate * 100) / 100,
      revenueChange: Math.round(revenueChange * 100) / 100,
      customerChange: Math.round(customerChange * 100) / 100,
      bookingChange: Math.round(bookingChange * 100) / 100,
    };
  }

  async getChartData(
    organizationId: string,
    days: number = 90,
  ): Promise<ChartData[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const leads = await this.leadRepository
      .createQueryBuilder('lead')
      .select('DATE(lead.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('lead.organization_id = :organizationId', { organizationId })
      .andWhere('lead.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(lead.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('DATE(booking.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('booking.organization_id = :organizationId', { organizationId })
      .andWhere('booking.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(booking.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Create a map of dates to counts
    const dateMap = new Map<string, { leads: number; bookings: number }>();

    // Initialize all dates with 0 counts
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { leads: 0, bookings: 0 });
    }

    // Fill in actual data
    leads.forEach((item) => {
      const dateStr = item.date;
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.leads = parseInt(item.count);
      }
    });

    bookings.forEach((item) => {
      const dateStr = item.date;
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.bookings = parseInt(item.count);
      }
    });

    // Convert to array format
    return Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      leads: counts.leads,
      bookings: counts.bookings,
    }));
  }

  private async getRevenueForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.booking', 'booking')
      .select('SUM(payment.amount)', 'total')
      .where('booking.organization_id = :organizationId', { organizationId })
      .andWhere('payment.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  private async getNewCustomersForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.customerRepository.count({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getBookingsForPeriod(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.bookingRepository.count({
      where: {
        organizationId,
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getTotalRevenue(organizationId: string): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.booking', 'booking')
      .select('SUM(payment.amount)', 'total')
      .where('booking.organization_id = :organizationId', { organizationId })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  private async getTotalBookings(organizationId: string): Promise<number> {
    return this.bookingRepository.count({
      where: { organizationId },
    });
  }

  private async getTotalCustomers(organizationId: string): Promise<number> {
    return this.customerRepository.count({
      where: { organizationId },
    });
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 1 : 0;
    }
    return (current - previous) / previous;
  }
}
