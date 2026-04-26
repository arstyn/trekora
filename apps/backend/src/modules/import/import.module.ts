import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { memoryStorage } from 'multer';
import { Branch } from 'src/database/entity/branch.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { ImportHistory } from 'src/database/entity/import-history.entity';
import { ImportTemplate } from 'src/database/entity/import-template.entity';
import { Lead } from 'src/database/entity/lead.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel'
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    TypeOrmModule.forFeature([
      Customer,
      Lead,
      Employee,
      Branch,
      ImportTemplate,
      ImportHistory,
    ]),
    JwtModule.register({}),
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
