import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { IMealCreateDTO } from 'src/dto/create-meal.dto';
import { IMealUpdateDTO } from 'src/dto/update-meal.dto';
import { Meals } from '../../database/entity/meals.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { MealsService } from './meals.service';

@UseGuards(AuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  private async checkAdminOrManager(req: ApiRequestJWT): Promise<void> {
    const isAuthorized = await this.mealsService.isAdminOrManager(
      req.user.userId,
      req.user.organizationId,
    );
    if (!isAuthorized) {
      throw new ForbiddenException(
        'Only Admin and Manager are allowed to perform this action',
      );
    }
  }

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() mealData: IMealCreateDTO,
  ): Promise<Meals> {
    await this.checkAdminOrManager(req);
    return this.mealsService.create({
      ...mealData,
      createdById: req.user.userId,
      organizationId: req.user.organizationId,
    });
  }

  @Get()
  async get(@Request() req: ApiRequestJWT): Promise<Meals[]> {
    return this.mealsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  async getOne(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<Meals> {
    return this.mealsService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateData: IMealUpdateDTO,
  ): Promise<Meals> {
    await this.checkAdminOrManager(req);
    return this.mealsService.update(id, req.user.organizationId, updateData);
  }

  @Delete(':id')
  async remove(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<Meals> {
    await this.checkAdminOrManager(req);
    return this.mealsService.remove(id, req.user.organizationId);
  }
}
