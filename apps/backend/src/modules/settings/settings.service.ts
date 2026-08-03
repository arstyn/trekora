import { BadRequestException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ClearDataDto } from './dto/data-clear.dto';
import { User } from 'src/database/entity/user.entity';
import { Otp } from 'src/database/entity/otp.entity';
import { MailerService } from '../mailer/mailer.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => ActivityLogService))
    private readonly activityLogService: ActivityLogService,
  ) {}

  /**
   * Helper to mask email for security display (e.g. j***n@example.com)
   */
  private maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  }

  /**
   * Send OTP for clearing organization data
   */
  async sendClearDataOtp(currentUserId: string): Promise<{ message: string; maskedEmail: string }> {
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: currentUserId } });

    if (!user || !user.email) {
      throw new NotFoundException('User account or email not found');
    }

    const otpValue = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const otpRepo = this.dataSource.getRepository(Otp);
    let otpRecord = await otpRepo.findOne({ where: { email: user.email } });

    if (otpRecord) {
      otpRecord.otp = otpValue;
      otpRecord.expiresAt = expiresAt;
      otpRecord.isVerified = false;
    } else {
      otpRecord = otpRepo.create({
        email: user.email,
        otp: otpValue,
        expiresAt,
        isVerified: false,
      });
    }

    await otpRepo.save(otpRecord);

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verification Code - Clear Organization Data',
      text: `Your verification code to clear organization data is: ${otpValue}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e0e0e0; rounded: 8px;">
          <h2 style="color: #d9534f;">Organization Data Purge Request</h2>
          <p>You requested to clear organization data on Trekora.</p>
          <p>Your 6-digit OTP verification code is:</p>
          <div style="background: #f8d7da; color: #721c24; font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 6px; margin: 16px 0;">
            ${otpValue}
          </div>
          <p style="color: #6c757d; font-size: 13px;">This code will expire in 10 minutes. If you did not initiate this request, please contact your administrator immediately.</p>
        </div>
      `,
    });

    const maskedEmail = this.maskEmail(user.email);
    return {
      message: `OTP sent successfully to ${maskedEmail}`,
      maskedEmail,
    };
  }

  /**
   * Clear organization data after OTP verification
   */
  async clearOrganizationData(
    organizationId: string,
    currentUserId: string,
    dto: ClearDataDto,
  ): Promise<{ success: boolean; cleared: Record<string, number> }> {
    // 1. Verify user & OTP
    const userRepo = this.dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: currentUserId } });

    if (!user || !user.email) {
      throw new NotFoundException('User account not found');
    }

    const otpRepo = this.dataSource.getRepository(Otp);
    const otpRecord = await otpRepo.findOne({ where: { email: user.email } });

    if (!otpRecord || otpRecord.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP verification code');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP verification code has expired. Please request a new code.');
    }

    // Invalidate OTP after successful verification
    otpRecord.otp = '';
    otpRecord.isVerified = true;
    await otpRepo.save(otpRecord);

    // 2. Start deletion transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const cleared: Record<string, number> = {};

    try {
      // Clear Payments explicitly if requested (without deleting whole bookings)
      if (dto.payments && !dto.bookings) {
        const result = await queryRunner.query(
          `DELETE FROM "booking_payments" WHERE "booking_id" IN (SELECT "id" FROM "bookings" WHERE "organization_id" = $1)`,
          [organizationId],
        );
        await queryRunner.query(
          `UPDATE "bookings" SET "advance_paid" = 0, "balance_amount" = "total_amount" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.payments = result[1] || 0;
      }

      // Handle Bookings deletion (clearing bookings also cascades to booking_payments, booking_logs, booking_documents, booking_checklists, booking_customers)
      if (dto.bookings || dto.batches || dto.customers || dto.packages) {
        if (dto.bookings) {
          const result = await queryRunner.query(
            `DELETE FROM "bookings" WHERE "organization_id" = $1`,
            [organizationId],
          );
          cleared.bookings = result[1] || 0;
        } else {
          // If Bookings itself is not checked, but dependent Batches/Customers/Packages ARE checked,
          // delete bookings referencing those specific entities to satisfy foreign key constraints.
          let cond = `WHERE "organization_id" = $1 AND (1=0`;
          if (dto.batches) cond += ` OR "batch_id" IN (SELECT "id" FROM "batch" WHERE "organization_id" = $1)`;
          if (dto.customers) cond += ` OR "customer_id" IN (SELECT "id" FROM "customer" WHERE "organization_id" = $1)`;
          if (dto.packages) cond += ` OR "package_id" IN (SELECT "id" FROM "packages" WHERE "organization_id" = $1)`;
          cond += `)`;

          await queryRunner.query(`DELETE FROM "bookings" ${cond}`, [organizationId]);
        }
      }

      // Clear Workflows (explicitly delete workflow_logs and workflow_steps before workflows to avoid foreign key violations)
      if (dto.workflows) {
        await queryRunner.query(
          `UPDATE "bookings" SET "current_workflow_id" = NULL WHERE "organization_id" = $1 AND "current_workflow_id" IN (SELECT "id" FROM "workflows" WHERE "organization_id" = $1)`,
          [organizationId],
        );
        await queryRunner.query(
          `DELETE FROM "workflow_logs" WHERE "workflow_id" IN (SELECT "id" FROM "workflows" WHERE "organization_id" = $1)`,
          [organizationId],
        );
        await queryRunner.query(
          `DELETE FROM "workflow_steps" WHERE "workflow_id" IN (SELECT "id" FROM "workflows" WHERE "organization_id" = $1)`,
          [organizationId],
        );
        const result = await queryRunner.query(
          `DELETE FROM "workflows" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.workflows = result[1] || 0;
      }

      // Clear Batches (cascades to batch_logs, batch_blocks, batch_coordinators, batch_customers)
      if (dto.batches) {
        const result = await queryRunner.query(
          `DELETE FROM "batch" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.batches = result[1] || 0;
      }

      // If Packages are cleared without Batches being cleared, delete batches referencing those packages
      if (dto.packages && !dto.batches) {
        await queryRunner.query(
          `DELETE FROM "batch" WHERE "package_id" IN (SELECT "id" FROM "packages" WHERE "organization_id" = $1)`,
          [organizationId],
        );
      }

      // Clear Leads (cascades to lead_update)
      if (dto.leads) {
        await queryRunner.query(
          `DELETE FROM "reminder" WHERE "organization_id" = $1 AND ("entity_type" = 'lead' OR "entity_type" = 'Lead')`,
          [organizationId],
        );
        const result = await queryRunner.query(
          `DELETE FROM "lead" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.leads = result[1] || 0;
      }

      // Clear Customers (cascades to customer references)
      if (dto.customers) {
        await queryRunner.query(
          `DELETE FROM "reminder" WHERE "organization_id" = $1 AND ("entity_type" = 'customer' OR "entity_type" = 'Customer')`,
          [organizationId],
        );
        const result = await queryRunner.query(
          `DELETE FROM "customer" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.customers = result[1] || 0;
      }

      // Clear Packages (cascades to all 13 package sub-tables)
      if (dto.packages) {
        const result = await queryRunner.query(
          `DELETE FROM "packages" WHERE "organization_id" = $1`,
          [organizationId],
        );
        cleared.packages = result[1] || 0;
      }

      // Clear Employees (except current user)
      if (dto.employees) {
        const result = await queryRunner.query(
          `DELETE FROM "employee" WHERE "organization_id" = $1 AND "user_id" != $2 AND "id" != $2`,
          [organizationId, currentUserId],
        );
        cleared.employees = result[1] || 0;
      }

      await queryRunner.commitTransaction();

      // Record Activity Log entry for the data purge action
      try {
        const clearedCategories = Object.keys(cleared);
        await this.activityLogService.log(
          organizationId,
          currentUserId,
          'clear_organization_data',
          `Organization data cleared for categories: ${clearedCategories.join(', ')}`,
          { cleared },
        );
      } catch (logError) {
        this.logger.error(`Failed to record activity log for data clear: ${logError.message}`);
      }

      return { success: true, cleared };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to clear organization data: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
