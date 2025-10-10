import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PreBookingStatus } from 'src/database/entity/pre-booking.entity';
import {
  ConvertLeadToPreBookingDto,
  ConvertPreBookingToBookingDto,
  CreateCustomerFromPreBookingDto,
  PreBookingResponseDto,
  PreBookingStatsDto,
  PreBookingSummaryDto,
  UpdatePreBookingDto,
  UpdatePreBookingPackageDto,
  UpdateTemporaryCustomerDetailsDto,
} from 'src/dto/pre-booking.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PreBookingService } from './pre-booking.service';

@UseGuards(AuthGuard)
@Controller('api/pre-bookings')
export class PreBookingController {
  constructor(private readonly preBookingService: PreBookingService) {}

  // Convert lead to pre-booking
  @Post('convert-lead')
  async convertLeadToPreBooking(
    @Body() dto: ConvertLeadToPreBookingDto,
    @Req() req: any,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.convertLeadToPreBooking(
      dto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  // Update package and dates
  @Patch(':id/package-dates')
  async updatePackageAndDates(
    @Param('id') id: string,
    @Body() dto: UpdatePreBookingPackageDto,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.updatePackageAndDates(id, dto);
  }

  // Update temporary customer details
  @Patch(':id/temporary-customer-details')
  async updateTemporaryCustomerDetails(
    @Param('id') id: string,
    @Body() dto: UpdateTemporaryCustomerDetailsDto,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.updateTemporaryCustomerDetails(id, dto);
  }

  // Create customer from pre-booking
  @Post(':id/create-customer')
  async createCustomerFromPreBooking(
    @Param('id') id: string,
    @Body() dto: CreateCustomerFromPreBookingDto,
    @Req() req: any,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.createCustomerFromPreBooking(
      id,
      dto,
      req.user.userId,
    );
  }

  // Convert to booking
  @Post(':id/convert-to-booking')
  async convertToBooking(
    @Param('id') id: string,
    @Body() dto: ConvertPreBookingToBookingDto,
    @Req() req: any,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.convertToBooking(id, dto, req.user.userId);
  }

  // Get all pre-bookings
  @Get()
  async findAll(
    @Req() req: any,
    @Query('status') status?: PreBookingStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PreBookingSummaryDto[]> {
    return this.preBookingService.findAll(
      req.user.organizationId,
      status,
      limit,
      offset,
    );
  }

  // Get one pre-booking
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PreBookingResponseDto> {
    return this.preBookingService.findOne(id);
  }

  // Update pre-booking
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePreBookingDto,
  ): Promise<PreBookingResponseDto> {
    return this.preBookingService.update(id, dto);
  }

  // Cancel pre-booking
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<PreBookingResponseDto> {
    return this.preBookingService.cancel(id);
  }

  // Delete pre-booking
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.preBookingService.remove(id);
  }

  // Get statistics
  @Get('stats/overview')
  async getStats(@Req() req: any): Promise<PreBookingStatsDto> {
    return this.preBookingService.getStats(req.user.organizationId);
  }
}
