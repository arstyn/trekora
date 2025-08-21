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
  ChartData,
  DashboardService,
  DashboardStats,
} from './dashboard.service';

@Controller('api/dashboard')
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
}
