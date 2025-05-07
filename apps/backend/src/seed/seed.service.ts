import { Injectable, Logger } from '@nestjs/common';
import { OrganizationService } from 'src/organization/organization.service';
import { organizations } from './seeds/organization.seed';
import { branches } from './seeds/branch.seed';
import { BranchService } from 'src/branch/branch.service';
import { UserService } from 'src/user/user.service';
import { users } from './seeds/user.seed';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly organizationService: OrganizationService,
    private readonly branchService: BranchService,
    private readonly userService: UserService,
  ) {}

  async seed() {
    this.logger.log('Seeding started...');
    await this.seedOrganizations();
    await this.seedBranches();
    await this.seedUsers();
    this.logger.log('Seeding completed');
  }

  async seedOrganizations() {
    for (const org of organizations) {
      await this.organizationService.create(org);
    }

    this.logger.log('Seeded organizations');
  }

  async seedBranches() {
    for (const branch of branches) {
      const { organization, ...branchDetails } = branch;
      const organizationData =
        await this.organizationService.findOneByName(organization);

      if (!organizationData) {
        this.logger.error(`Organization ${organization} not found`);
        continue;
      }

      await this.branchService.create({
        ...branchDetails,
        organizationId: organizationData.id,
      });
    }

    this.logger.log('Seeded branches');
  }

  async seedUsers() {
    for (const user of users) {
      const { organization, branch, ...userDetails } = user;

      const organizationData =
        await this.organizationService.findOneByName(organization);
      if (!organizationData) {
        this.logger.error(`Organization ${organization} not found`);
        continue;
      }
      const branchData = await this.branchService.findOneByName(branch);
      if (!branchData) {
        this.logger.error(`Branch ${branch} not found`);
        continue;
      }
      user.password = await bcrypt.hash(user.password, 10);

      await this.userService.create({
        ...userDetails,
        branchId: branchData.id,
        organizationId: organizationData.id,
        password: user.password,
      });
    }

    this.logger.log('Seeded users');
  }
}
