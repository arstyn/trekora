import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PackageService } from './package.service';
import { ICreatePackageDto } from '@repo/api/package/dto/create-package.dto';
import { Package } from './entity/package.entity';
import { ApiRequestJWT } from '@repo/api/auth/dto/api-request-jwt.types';

@UseGuards(AuthGuard)
@Controller('api/package')
export class PackageController {
    constructor(private readonly packageService: PackageService) { }

    //create new package
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: ICreatePackageDto): Promise<Package> {
        return await this.packageService.create(dto)
    }

    //get all packages
    @Get()
    async findAll(@Request() req: ApiRequestJWT): Promise<Package[]> {
        return await this.packageService.findAll(req.user.organizationId);
    }

    //get particular package with id
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Package> {
        return await this.packageService.findOne(id);
    }

    // update a particular package
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: ICreatePackageDto,
    ): Promise<Package> {
        return await this.packageService.update(id, dto);
    }

    // delete a package
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string): Promise<void> {
        await this.packageService.delete(id);
    }
}

