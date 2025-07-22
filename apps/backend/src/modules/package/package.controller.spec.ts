import { Test, TestingModule } from '@nestjs/testing';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';

const mockPackage = {
  id: 1,
  name: 'Test',
  description: 'Desc',
  price: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockService = {
  create: jest.fn().mockResolvedValue(mockPackage),
  findAll: jest.fn().mockResolvedValue([mockPackage]),
  findOne: jest.fn().mockResolvedValue(mockPackage),
  update: jest.fn().mockResolvedValue(mockPackage),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('PackageController', () => {
  let controller: PackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackageController],
      providers: [{ provide: PackageService, useValue: mockService }],
    }).compile();
    controller = module.get<PackageController>(PackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a package', async () => {
    expect(
      await controller.create({ name: 'Test', description: 'Desc', price: 10 }),
    ).toEqual(mockPackage);
  });

  it('should find all packages', async () => {
    expect(await controller.findAll()).toEqual([mockPackage]);
  });

  it('should find one package', async () => {
    expect(await controller.findOne('1')).toEqual(mockPackage);
  });

  it('should update a package', async () => {
    expect(await controller.update('1', { name: 'Updated' })).toEqual(
      mockPackage,
    );
  });

  it('should remove a package', async () => {
    await expect(controller.remove('1')).resolves.toBeUndefined();
  });
});
