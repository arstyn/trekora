import { Injectable, Logger } from '@nestjs/common';
import { OrganizationService } from 'src/modules/organization/organization.service';
import { organizations } from './seeds/organization.seed';
import { branches } from './seeds/branch.seed';
import { BranchService } from 'src/modules/branch/branch.service';
import { UserService } from 'src/modules/user/user.service';
import { users } from './seeds/user.seed';
import * as bcrypt from 'bcrypt';
import { Connection } from 'typeorm';
import { RoleService } from 'src/modules/role/role.service';
import { roles } from './seeds/role.seed';
import { UserRoleService } from 'src/modules/user_role/user_role.service';
import { DepartmentService } from 'src/modules/department/department.service';
import { departments } from './seeds/department.seed';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private connection: Connection,
    private readonly organizationService: OrganizationService,
    private readonly branchService: BranchService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly departmentService: DepartmentService,
  ) {}

  async seed() {
    this.logger.log('Deleting existing data...');
    await this.deleteAllTable();
    this.logger.log('Data deletion completed');
    this.logger.log('Seeding started...');
    await this.seedRoles();
    await this.seedOrganizations();
    await this.seedBranches();
    await this.seedUsers();
    await this.seedUserRoles();
    await this.seedDepartments();
    this.logger.log('Seeding completed');
  }

  async deleteAllTable(): Promise<void> {
    try {
      const entities = this.connection.entityMetadatas;

      for (const entity of entities) {
        await this.connection.query(
          `TRUNCATE TABLE "${entity.tableName}" CASCADE`,
        );
        this.logger.log(
          `Data deleted successfully from table: ${entity.tableName}`,
        );
      }
      this.logger.log('Deletion process completed.');
    } catch (error) {
      const errorData = error as { message: string };
      this.logger.error(`Error deleting data: ${errorData.message}`);
      throw new Error('Failed to delete data.');
    }
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

  async seedRoles() {
    for (const role of roles) {
      await this.roleService.create(role);
    }

    this.logger.log('Seeded roles');
  }

  async seedUserRoles() {
    const role = await this.roleService.findByName('admin');
    const users = await this.userService.findAll();

    for (const user of users) {
      await this.userRoleService.create({
        userId: user.id,
        roleId: role.id,
      });
    }

    this.logger.log('Seeded user roles');
  }

  async seedDepartments() {
    for (const dept of departments) {
      await this.departmentService.create(dept);
    }
  }
}
