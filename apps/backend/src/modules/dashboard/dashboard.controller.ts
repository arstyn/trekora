import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  BestPerformingPackage,
  ChartData,
  DashboardService,
  DashboardStats,
  FastFillingBatch,
  LatestBooking,
  LatestLead,
} from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(
    @Request() req: ApiRequestJWT,
  ): Promise<DashboardStats> {
    // Extract organization ID from the authenticated user
    const organizationId = req.user.organizationId;
    return this.dashboardService.getDashboardStats(organizationId);
  }

  @Get('chart-data')
  async getChartData(
    @Request() req: ApiRequestJWT,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 90,
  ): Promise<ChartData[]> {
    const organizationId = req.user.organizationId;
    return this.dashboardService.getChartData(organizationId, days);
  }

  @Get('latest-bookings')
  async getLatestBookings(
    @Request() req: ApiRequestJWT,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<LatestBooking[]> {
    const organizationId = req.user.organizationId;
    return this.dashboardService.getLatestBookings(organizationId, limit);
  }

  @Get('latest-leads')
  async getLatestLeads(
    @Request() req: ApiRequestJWT,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<LatestLead[]> {
    const organizationId = req.user.organizationId;
    return this.dashboardService.getLatestLeads(organizationId, limit);
  }

  @Get('fast-filling-batches')
  async getFastFillingBatches(
    @Request() req: ApiRequestJWT,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<FastFillingBatch[]> {
    const organizationId = req.user.organizationId;
    return this.dashboardService.getFastFillingBatches(organizationId, limit);
  }

  @Get('best-performing-packages')
  async getBestPerformingPackages(
    @Request() req: ApiRequestJWT,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<BestPerformingPackage[]> {
    const organizationId = req.user.organizationId;
    return this.dashboardService.getBestPerformingPackages(
      organizationId,
      limit,
    );
  }
}
