import { Department } from '../../modules/department/entity/department.entity';

// Example seed data
export const departments: Partial<Department>[] = [
  {
    name: 'Human Resources',
    description: 'Handles recruitment, onboarding, and employee relations.',
  },
  {
    name: 'Operations',
    description: 'Responsible for operations and maintenance.',
  },
  {
    name: 'Sales',
    description: 'Manages client relationships and sales operations.',
  },
];
