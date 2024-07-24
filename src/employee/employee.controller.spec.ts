import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useClass: Repository<Employee>,
        },
      ],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
  });

  describe('POST /employee', () => {
    it('should create and employee and return the created employee object', async () => {
      const employee = {
        name: 'John Doe',
        salary: 30,
        currency: 'Software Engineer',
        department: 'Engineering',
        sub_department: 'Software Development',
      };
      jest.spyOn(service, 'create').mockResolvedValue({
        ...employee,
        id: 1,
      });
      await expect(controller.create(employee)).resolves.toMatchObject(
        employee,
      );
      expect(service.create).toHaveBeenCalledWith(employee);
    });
  });

  describe('DELETE /employee/:id', () => {
    beforeEach(() => {
      jest.spyOn(service, 'delete').mockImplementation(async (id: string) => {
        if (parseInt(id) === 1) {
          return true;
        }
        throw new Error('Employee not found');
      });
    });

    it("should delete an existing employee given it's id", async () => {
      const id = '1';
      await expect(controller.delete(id)).resolves.toEqual(true);
      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('should throw an error when id does not exist', async () => {
      const id = '10';
      await expect(controller.delete(id)).rejects.toThrow('Employee not found');
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});
