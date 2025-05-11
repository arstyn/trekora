import { Module } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';

@Module({
  providers: [FeatureService],
  controllers: [FeatureController]
})
export class FeatureModule {}
