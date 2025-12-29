import { Department } from '../entity/department.entity';

// Example seed data
export const departments: Partial<Department>[] = [
  {
    name: 'Operations',
    description: 'Responsible for operations and maintenance.',
  },
  {
    name: 'Sales',
    description: 'Manages client relationships and sales operations.',
  },
  {
    name: 'Finance',
    description: 'Responsible for financial operations and reporting.',
  },
  {
    name: 'Tour Operations',
    description:
      'Tour agents who travel with guests and manage on-site tour activities.',
  },
];
