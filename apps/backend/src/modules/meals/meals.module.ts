import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Meals } from 'src/database/entity/meals.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

@Module({
  controllers: [MealsController],
  providers: [MealsService],
  imports: [
    TypeOrmModule.forFeature([Meals, Employee]),
    JwtModule.register({}),
  ],
  exports: [MealsService],
})
export class MealsModule {}
