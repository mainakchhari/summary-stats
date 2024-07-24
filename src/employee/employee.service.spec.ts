import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Employee),
          useFactory: () => ({
            save: jest.fn().mockImplementation((employee) => ({
              ...employee,
              id: '1',
            })),
            delete: jest.fn().mockImplementation((id) => {
              if (id === '1') {
                return { affected: 1 };
              }
              return { affected: 0 };
            }),
          }),
        },
        EmployeeService,
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('create an employee', () => {
    it('should create a new employee', () => {
      const employee = {
        name: 'John Doe',
        salary: 30,
        currency: 'Software Engineer',
        department: 'Engineering',
        sub_department: 'Software Development',
      };
      expect(service.create(employee)).toMatchObject(employee);
    });
  });

  describe('delete an employee', () => {
    it('should delete an existing employee by id', async () => {
      await expect(service.delete('1')).resolves.toEqual(true);
    });

    it('should throw error if id does not exist', async () => {
      const id = '10';
      await expect(service.delete(id)).rejects.toThrow();
    });
  });
});
