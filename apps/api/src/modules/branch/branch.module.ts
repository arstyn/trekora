import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';
import { Branch } from 'src/database/entity/branch.entity';

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [
    TypeOrmModule.forFeature([Branch]),
    JwtModule.register({}),
    RoleModule,
  ],
  exports: [BranchService],
})
export class BranchModule {}
