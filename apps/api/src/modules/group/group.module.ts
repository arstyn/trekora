import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entity/group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), JwtModule.register({})],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
