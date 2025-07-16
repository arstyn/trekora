import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/database/entity/customer.entity';
import { Lead } from 'src/database/entity/lead.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { ImportTemplate } from 'src/database/entity/import-template.entity';
import { Role } from 'src/database/entity/role.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
          cb(null, true);
        } else {
          cb(new Error('Only Excel files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
    TypeOrmModule.forFeature([Customer, Lead, Employee, ImportTemplate, Role]),
    JwtModule.register({}),
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {} 