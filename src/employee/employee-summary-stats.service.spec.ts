import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSummaryStatsService } from './employee-summary-stats.service';
import { Employee } from './entities/employee.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EmployeeSummaryStatsService', () => {
  let service: EmployeeSummaryStatsService;

  describe('getSummaryStats', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: getRepositoryToken(Employee),
            useFactory: () => ({
              createQueryBuilder: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockImplementation(() => {
                  return {
                    min: 30,
                    max: 200000000,
                    mean: 22295010,
                  };
                }),
              })),
            }),
          },
          EmployeeSummaryStatsService,
        ],
      }).compile();

      service = module.get<EmployeeSummaryStatsService>(
        EmployeeSummaryStatsService,
      );
    });

    it('should return summary stats for the whole employee dataset', () => {
      const summaryStats = service.getMinMaxMean();
      expect(summaryStats).toEqual({
        min: 30,
        max: 200000000,
        mean: 22295010,
      });
    });
  });

  describe('getSummaryStatsFilterBy', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: getRepositoryToken(Employee),
            useFactory: () => ({
              createQueryBuilder: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockImplementation(() => {
                  return {
                    min: 30,
                    max: 200000000,
                    mean: 22295010,
                  };
                }),
              })),
            }),
          },
          EmployeeSummaryStatsService,
        ],
      }).compile();

      service = module.get<EmployeeSummaryStatsService>(
        EmployeeSummaryStatsService,
      );
    });

    it('should return summary stats for contract employees only', () => {
      const summaryStats = service.getMinMaxMeanFilterBy({
        on_contract: true,
      });
      expect(summaryStats).toEqual({
        min: 90000,
        max: 110000,
        mean: 100000,
      });
    });

    it('should return summary stats for non-contract employees only', () => {
      const summaryStats = service.getMinMaxMeanFilterBy({
        on_contract: false,
      });
      expect(summaryStats).toEqual({
        min: 30,
        max: 200000000,
        mean: 28636441.43,
      });
    });
  });

  describe('getSummaryStatsGroupBy', () => {
    it('should return summary stats grouped by department', () => {
      const summaryStats = service.getMinMaxMeanGroupBy('dept');
      expect(summaryStats).toEqual([
        {
          department: 'Engineering',
          min: 30,
          max: 200000000,
          mean: 33920143.43,
        },
        {
          department: 'Banking',
          min: 90000,
          max: 90000,
          mean: 90000,
        },
        {
          department: 'Operations',
          min: 30,
          max: 70000,
          mean: 35015,
        },
        {
          department: 'Administration',
          min: 30,
          max: 30,
          mean: 30,
        },
      ]);
    });

    it('should return summary stats grouped by department and sub-department', () => {
      const summaryStats = service.getMinMaxMeanGroupBy('sub-dept');
      expect(summaryStats).toEqual([
        {
          department: 'Engineering',
          sub_department: 'Platform',
          min: 30,
          max: 200000000,
          mean: 33920143.43,
        },
        {
          department: 'Banking',
          sub_department: 'Loan',
          min: 90000,
          max: 90000,
          mean: 90000,
        },
        {
          department: 'Operations',
          sub_department: 'CustomerOnboarding',
          min: 30,
          max: 70000,
          mean: 35015,
        },
        {
          department: 'Administration',
          sub_department: 'Agriculture',
          min: 30,
          max: 30,
          mean: 30,
        },
      ]);
    });
  });
});
