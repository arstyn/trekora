import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CreatePaymentDto,
} from 'src/dto/booking.dto';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from 'src/dto/checklist-dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { ChecklistType } from 'src/database/entity/booking-checklist-entity';

@UseGuards(AuthGuard)
@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.create(
      createBookingDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  findAll(
    @Request() req: ApiRequestJWT,
    @Query('status') status?: BookingStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.bookingService.findAll(
      req.user.organizationId,
      status,
      limit,
      offset,
    );
  }

  // @Get('stats')
  // getStats(@Request() req: ApiRequestJWT) {
  //   return this.bookingService.getStats(req.user.organizationId);
  // }

  // @Get('recent')
  // getRecentBookings(
  //   @Request() req: ApiRequestJWT,
  //   @Query('limit') limit?: number,
  // ) {
  //   return this.bookingService.getRecentBookings(
  //     req.user.organizationId,
  //     limit,
  //   );
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }

  @Post(':id/payments')
  addPayment(
    @Param('id') id: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: ApiRequestJWT,
  ) {
    return this.bookingService.addPayment(
      id,
      createPaymentDto,
      req.user.userId,
    );
  }

  // Checklist endpoints
  @Post(':id/checklist')
  addChecklistItem(
    @Param('id') bookingId: string,
    @Body() createChecklistDto: CreateChecklistItemDto,
  ) {
    return this.bookingService.addChecklistItem(bookingId, createChecklistDto);
  }

  @Patch('checklist/:checklistId')
  updateChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body() updateChecklistDto: UpdateChecklistItemDto,
  ) {
    return this.bookingService.updateChecklistItem(checklistId, updateChecklistDto);
  }

  @Delete('checklist/:checklistId')
  deleteChecklistItem(@Param('checklistId') checklistId: string) {
    return this.bookingService.deleteChecklistItem(checklistId);
  }

  @Patch('checklist/:checklistId/toggle')
  toggleChecklistItem(@Param('checklistId') checklistId: string) {
    return this.bookingService.toggleChecklistItem(checklistId);
  }

  @Get(':id/checklist/stats')
  getChecklistStats(
    @Param('id') bookingId: string,
    @Query('type') type?: ChecklistType,
  ) {
    return this.bookingService.getChecklistStats(bookingId, type);
  }
}