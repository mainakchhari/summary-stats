import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSummaryStatsController } from './employee-summary-stats.controller';
import { EmployeeSummaryStatsService } from './employee-summary-stats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

const mockEmployeeDataset = [
  {
    name: 'John Smith',
    salary: 1000,
    currency: 'USD',
    department: 'Engineering',
    sub_department: 'Platform',
  },
  {
    name: 'Jane Doe',
    salary: 100,
    currency: 'EUR',
    on_contract: true,
    department: 'Operations',
    sub_department: 'CustomerOnboarding',
  },
];

const SummaryStatsReducer = (p, c, i, a) => ({
  min: Math.min(p.min, c.salary),
  max: Math.max(p.max, c.salary),
  mean: (p.mean * i + c.salary) / (i + 1),
});

const SummaryStatsInitializer = {
  min: Number.MAX_VALUE,
  max: Number.MIN_VALUE,
  mean: 0,
};

describe('EmployeeSummaryStatsController', () => {
  let controller: EmployeeSummaryStatsController;
  let service: EmployeeSummaryStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeSummaryStatsController],
      providers: [
        EmployeeSummaryStatsService,
        {
          provide: getRepositoryToken(Employee),
          useClass: Repository<Employee>,
        },
      ],
    }).compile();

    controller = module.get<EmployeeSummaryStatsController>(
      EmployeeSummaryStatsController,
    );

    service = module.get<EmployeeSummaryStatsService>(
      EmployeeSummaryStatsService,
    );
  });

  describe('GET /employee-summary-stats', () => {
    const allEmployeeSummaryStats = mockEmployeeDataset.reduce(
      SummaryStatsReducer,
      SummaryStatsInitializer,
    );

    it('should return an object of employee summary stats', async () => {
      jest
        .spyOn(service, 'getMinMaxMean')
        .mockResolvedValue(allEmployeeSummaryStats);

      expect(await controller.aggregateAll(null)).toEqual({
        min: 100,
        max: 1000,
        mean: 550,
      });
    });
  });

  describe('GET /employee-summary-stats?on_contract=true', () => {
    const contractEmployeeSummaryStats = mockEmployeeDataset
      .filter((e) => e.on_contract === true)
      .reduce(SummaryStatsReducer, SummaryStatsInitializer);

    it('should return summary stats object for contract employees only', async () => {
      jest
        .spyOn(service, 'getMinMaxMeanFilterBy')
        .mockResolvedValue(contractEmployeeSummaryStats);

      expect(await controller.aggregateAll({ on_contract: true })).toEqual({
        min: 100,
        max: 100,
        mean: 100,
      });
    });
  });

  describe('GET /employee-summary-stats/by-department', () => {
    const employeeSummaryStatsByDepartment = Object.entries(
      mockEmployeeDataset.reduce((acc, curr) => {
        if (!acc[curr.department]) {
          acc[curr.department] = { ...SummaryStatsInitializer };
        }

        acc[curr.department] = {
          ...acc[curr.department],
          ...SummaryStatsReducer(acc[curr.department], curr, null, null),
        };

        return acc;
      }, {}),
    ).map(([k, v]) => ({
      department: k,
      ...(v as any),
    }));

    it('should return an array of employee summary stats grouped by department', async () => {
      jest
        .spyOn(service, 'getMinMaxMeanGroupBy')
        .mockResolvedValue(employeeSummaryStatsByDepartment);

      expect(await controller.aggregateByDepartment()).toEqual([
        {
          department: 'Engineering',
          min: 1000,
          max: 1000,
          mean: 1000,
        },
        {
          department: 'Operations',
          min: 100,
          max: 100,
          mean: 100,
        },
      ]);
    });
  });

  describe('GET /employee-summary-stats/by-sub-department', () => {
    const employeeSummaryStatsBySubDepartment = Object.entries(
      mockEmployeeDataset.reduce((acc, curr) => {
        if (!acc[curr.sub_department]) {
          acc[curr.sub_department] = { ...SummaryStatsInitializer };
        }

        acc[curr.sub_department] = {
          ...acc[curr.sub_department],
          ...SummaryStatsReducer(acc[curr.sub_department], curr, null, null),
        };

        return acc;
      }, {}),
    ).map(([k, v]) => ({
      department: Object.values(
        mockEmployeeDataset.filter((v) => v.sub_department == k),
      )[0].department,
      sub_department: k,
      ...(v as any),
    }));

    it('should return an array of employee summary stats grouped by department and sub-department', async () => {
      jest
        .spyOn(service, 'getMinMaxMeanGroupBy')
        .mockResolvedValue(employeeSummaryStatsBySubDepartment);

      expect(await controller.aggregateBySubDepartment()).toEqual([
        {
          department: 'Engineering',
          sub_department: 'Platform',
          min: 1000,
          max: 1000,
          mean: 1000,
        },
        {
          department: 'Operations',
          sub_department: 'CustomerOnboarding',
          min: 100,
          max: 100,
          mean: 100,
        },
      ]);
    });
  });
});
