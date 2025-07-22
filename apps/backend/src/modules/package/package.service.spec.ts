import { Test, TestingModule } from '@nestjs/testing';
import { PackageService } from './package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from '../../database/entity/package-related/package.entity';
import { Repository } from 'typeorm';

const mockPackage = {
  id: 1,
  name: 'Test',
  description: 'Desc',
  price: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepo = () => ({
  create: jest.fn().mockReturnValue(mockPackage),
  save: jest.fn().mockResolvedValue(mockPackage),
  find: jest.fn().mockResolvedValue([mockPackage]),
  findOneBy: jest.fn().mockResolvedValue(mockPackage),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
});

describe('PackageService', () => {
  let service: PackageService;
  let repo: Repository<Package>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackageService,
        { provide: getRepositoryToken(Package), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<PackageService>(PackageService);
    repo = module.get<Repository<Package>>(getRepositoryToken(Package));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a package', async () => {
    expect(
      await service.create({ name: 'Test', description: 'Desc', price: 10 }),
    ).toEqual(mockPackage);
  });

  it('should find all packages', async () => {
    expect(await service.findAll()).toEqual([mockPackage]);
  });

  it('should find one package', async () => {
    expect(await service.findOne(1)).toEqual(mockPackage);
  });

  it('should update a package', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(mockPackage as any);
    expect(await service.update(1, { name: 'Updated' })).toEqual(mockPackage);
  });

  it('should remove a package', async () => {
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});
