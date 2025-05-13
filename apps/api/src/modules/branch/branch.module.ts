import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { Branch } from './entity/branch.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), JwtModule.register({})],
  exports: [BranchService],
  providers: [BranchService],
  controllers: [BranchController],
})
export class BranchModule {}
