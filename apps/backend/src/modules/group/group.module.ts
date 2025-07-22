import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { JwtModule } from '@nestjs/jwt';
import { Group } from 'src/database/entity/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), JwtModule.register({})],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
