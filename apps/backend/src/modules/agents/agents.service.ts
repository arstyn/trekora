import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent, AgentStatus } from 'src/database/entity/agent.entity';
import { AgentPayoutStatus, Booking, BookingStatus } from 'src/database/entity/booking.entity';
import { AgentResponseDto, CreateAgentDto, UpdateAgentDto } from 'src/dto/agent.dto';
import { Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(createAgentDto: CreateAgentDto, organizationId: string, userId?: string): Promise<Agent> {
    const agent = this.agentRepository.create({
      ...createAgentDto,
      organizationId,
    });
    const saved = await this.agentRepository.save(agent);

    try {
      await this.activityLogService.log(
        organizationId,
        userId || '',
        'agent_created',
        `Created agent partner ${saved.name} (${saved.agencyName || 'Independent'})`,
        { agentId: saved.id, email: saved.email, phone: saved.phone },
      );
    } catch (err) {
      console.error('Failed to log agent creation:', err);
    }

    return saved;
  }

  async findAll(
    organizationId: string,
    search?: string,
    status?: AgentStatus,
  ): Promise<AgentResponseDto[]> {
    const query = this.agentRepository
      .createQueryBuilder('agent')
      .leftJoinAndSelect('agent.bookings', 'booking')
      .where('agent.organizationId = :organizationId', { organizationId })
      .orderBy('agent.createdAt', 'DESC');

    if (status) {
      query.andWhere('agent.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(agent.name ILIKE :search OR agent.agencyName ILIKE :search OR agent.email ILIKE :search OR agent.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const agents = await query.getMany();

    return agents.map((agent) => {
      const activeBookings = (agent.bookings || []).filter(
        (b) => b.status !== BookingStatus.CANCELLED,
      );

      const totalBookings = activeBookings.length;
      const totalCommissionEarned = activeBookings.reduce(
        (sum, b) => sum + Number(b.agentCommissionAmount || 0),
        0,
      );
      const totalCommissionPaid = activeBookings
        .filter((b) => b.agentPayoutStatus === AgentPayoutStatus.PAID)
        .reduce((sum, b) => sum + Number(b.agentCommissionAmount || 0), 0);
      const pendingCommissionPayout = Math.max(
        0,
        totalCommissionEarned - totalCommissionPaid,
      );

      return {
        id: agent.id,
        name: agent.name,
        agencyName: agent.agencyName,
        email: agent.email,
        phone: agent.phone,
        commissionType: agent.commissionType,
        commissionValue: Number(agent.commissionValue || 0),
        status: agent.status,
        notes: agent.notes,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        totalBookings,
        totalCommissionEarned,
        totalCommissionPaid,
        pendingCommissionPayout,
      };
    });
  }

  async findOne(id: string, organizationId: string): Promise<any> {
    const agent = await this.agentRepository.findOne({
      where: { id, organizationId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const bookings = await this.bookingRepository.find({
      where: { agentId: id, organizationId },
      relations: ['customer', 'package', 'batch'],
      order: { createdAt: 'DESC' },
    });

    const activeBookings = bookings.filter(
      (b) => b.status !== BookingStatus.CANCELLED,
    );

    const totalBookings = activeBookings.length;
    const totalCommissionEarned = activeBookings.reduce(
      (sum, b) => sum + Number(b.agentCommissionAmount || 0),
      0,
    );
    const totalCommissionPaid = activeBookings
      .filter((b) => b.agentPayoutStatus === AgentPayoutStatus.PAID)
      .reduce((sum, b) => sum + Number(b.agentCommissionAmount || 0), 0);
    const pendingCommissionPayout = Math.max(
      0,
      totalCommissionEarned - totalCommissionPaid,
    );

    return {
      id: agent.id,
      name: agent.name,
      agencyName: agent.agencyName,
      email: agent.email,
      phone: agent.phone,
      commissionType: agent.commissionType,
      commissionValue: Number(agent.commissionValue || 0),
      status: agent.status,
      notes: agent.notes,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      totalBookings,
      totalCommissionEarned,
      totalCommissionPaid,
      pendingCommissionPayout,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        customerName: b.customer
          ? `${b.customer.firstName} ${b.customer.lastName || ''}`.trim()
          : 'N/A',
        customerPhone: b.customer?.phone || '',
        packageName: b.package?.name || 'N/A',
        batchStartDate: b.batch?.startDate,
        numberOfCustomers: b.numberOfCustomers,
        totalAmount: Number(b.totalAmount || 0),
        status: b.status,
        agentCommissionType: b.agentCommissionType,
        agentCommissionValue: Number(b.agentCommissionValue || 0),
        agentCommissionAmount: Number(b.agentCommissionAmount || 0),
        agentPayoutStatus: b.agentPayoutStatus,
        createdAt: b.createdAt,
      })),
    };
  }

  async update(
    id: string,
    updateAgentDto: UpdateAgentDto,
    organizationId: string,
    userId?: string,
  ): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id, organizationId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    Object.assign(agent, updateAgentDto);
    const updated = await this.agentRepository.save(agent);

    try {
      await this.activityLogService.log(
        organizationId,
        userId || '',
        'agent_updated',
        `Updated profile details for agent ${updated.name}`,
        { agentId: id, changes: Object.keys(updateAgentDto) },
      );
    } catch (err) {
      console.error('Failed to log agent update:', err);
    }

    return updated;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const agent = await this.agentRepository.findOne({
      where: { id, organizationId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    await this.agentRepository.remove(agent);
  }

  async updatePayoutStatus(
    bookingId: string,
    payoutStatus: AgentPayoutStatus,
    organizationId: string,
    userId?: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, organizationId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const previousStatus = booking.agentPayoutStatus;
    booking.agentPayoutStatus = payoutStatus;
    const saved = await this.bookingRepository.save(booking);

    try {
      await this.activityLogService.log(
        organizationId,
        userId || '',
        'agent_payout_updated',
        `Agent payout status updated to ${payoutStatus} for booking #${booking.bookingNumber}`,
        {
          agentId: booking.agentId,
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          previousStatus,
          newStatus: payoutStatus,
          amount: booking.agentCommissionAmount,
        },
      );
    } catch (err) {
      console.error('Failed to log payout status update:', err);
    }

    return saved;
  }
}
