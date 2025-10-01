import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BookingPayment } from '../../database/entity/booking-payment.entity';
import { Booking } from '../../database/entity/booking.entity';
import { Customer } from '../../database/entity/customer.entity';
import { Lead } from '../../database/entity/lead.entity';
import { Batch } from '../../database/entity/batch.entity';
import { Package } from '../../database/entity/package-related/package.entity';

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

export interface LatestBooking {
  id: string;
  bookingNumber: string;
  customerName: string;
  packageName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  numberOfPassengers: number;
}

export interface LatestLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  createdAt: Date;
  notes: string;
}

export interface FastFillingBatch {
  id: string;
  packageName: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  bookedSeats: number;
  fillPercentage: number;
  status: string;
}

export interface BestPerformingPackage {
  id: string;
  name: string;
  destination: string;
  category: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  status: string;
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
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
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
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.leads = parseInt(item.count);
      }
    });

    bookings.forEach((item) => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.bookings = parseInt(item.count);
      }
    });

    // Convert to array format
    const data = Array.from(dateMap.entries()).map(([date, counts]) => ({
      date,
      leads: counts.leads,
      bookings: counts.bookings,
    }));

    return data;
  }

  async getLatestBookings(
    organizationId: string,
    limit: number = 10,
  ): Promise<LatestBooking[]> {
    return this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .select([
        'booking.id',
        'booking.bookingNumber',
        'booking.totalAmount',
        'booking.status',
        'booking.createdAt',
        'booking.numberOfPassengers',
        'customer.firstName',
        'customer.lastName',
        'package.name',
      ])
      .where('booking.organization_id = :organizationId', { organizationId })
      .orderBy('booking.createdAt', 'DESC')
      .limit(limit)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          id: result.booking_id,
          bookingNumber: result.booking_bookingNumber,
          customerName:
            result.customer_firstName + ' ' + result.customer_lastName,
          packageName: result.package_name,
          totalAmount: parseFloat(result.booking_totalAmount),
          status: result.booking_status,
          createdAt: result.booking_createdAt,
          numberOfPassengers: result.booking_numberOfPassengers,
        })),
      );
  }

  async getLatestLeads(
    organizationId: string,
    limit: number = 10,
  ): Promise<LatestLead[]> {
    return this.leadRepository
      .createQueryBuilder('lead')
      .select([
        'lead.id',
        'lead.name',
        'lead.email',
        'lead.phone',
        'lead.company',
        'lead.status',
        'lead.createdAt',
        'lead.notes',
      ])
      .where('lead.organization_id = :organizationId', { organizationId })
      .orderBy('lead.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getFastFillingBatches(
    organizationId: string,
    limit: number = 10,
  ): Promise<FastFillingBatch[]> {
    return this.batchRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.package', 'package')
      .select([
        'batch.id',
        'batch.startDate',
        'batch.endDate',
        'batch.totalSeats',
        'batch.bookedSeats',
        'batch.status',
        'package.name',
        'package.destination',
      ])
      .where('batch.organization_id = :organizationId', { organizationId })
      .andWhere('batch.status = :status', { status: 'active' })
      .addSelect(
        '(batch.booked_seats::decimal / NULLIF(batch.total_seats, 0) * 100)',
        'fillPercentage',
      )
      .orderBy('"fillPercentage"', 'DESC')
      .limit(limit)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          id: result.batch_id,
          packageName: result.package_name,
          destination: result.package_destination,
          startDate: result.batch_startDate,
          endDate: result.batch_endDate,
          totalSeats: result.batch_totalSeats,
          bookedSeats: result.batch_bookedSeats,
          fillPercentage:
            Math.round(parseFloat(result.fillPercentage) * 100) / 100,
          status: result.batch_status,
        })),
      );
  }

  async getBestPerformingPackages(
    organizationId: string,
    limit: number = 10,
  ): Promise<BestPerformingPackage[]> {
    return this.packageRepository
      .createQueryBuilder('package')
      .leftJoin('package.bookings', 'booking') // use relation from entity
      .leftJoin('booking.payments', 'payment') // use relation from entity
      .select([
        'package.id',
        'package.name',
        'package.destination',
        'package.category',
        'package.status',
      ])
      .addSelect('COUNT(DISTINCT booking.id)', 'totalBookings')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .addSelect('0', 'averageRating')
      .where('package.organizationId = :organizationId', { organizationId })
      .andWhere('package.status = :status', { status: 'published' })
      .groupBy('package.id')
      .orderBy('"totalBookings"', 'DESC')
      .addOrderBy('"totalRevenue"', 'DESC')
      .limit(limit)
      .getRawMany()
      .then((results) =>
        results.map((result) => ({
          id: result.package_id,
          name: result.package_name,
          destination: result.package_destination,
          category: result.package_category,
          totalBookings: parseInt(result.totalBookings),
          totalRevenue: parseFloat(result.totalRevenue),
          averageRating: 0,
          status: result.package_status,
        })),
      );
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
