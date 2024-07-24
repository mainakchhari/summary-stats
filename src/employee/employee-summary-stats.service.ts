import { Injectable } from '@nestjs/common';
import { FilterSummaryStatsDto } from './dto/filter-summary-stats.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeSummaryStatsService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  getMinMaxMean(): any {
    return this.employeeRepository
      .createQueryBuilder()
      .select('MIN(salary)', 'min')
      .addSelect('MAX(salary)', 'max')
      .addSelect('AVG(salary)', 'mean')
      .getRawOne();
  }

  getMinMaxMeanFilterBy({ on_contract }: FilterSummaryStatsDto) {
    return this.employeeRepository
      .createQueryBuilder()
      .select('MIN(salary)', 'min')
      .addSelect('MAX(salary)', 'max')
      .addSelect('AVG(salary)', 'mean')
      .where('on_contract = :on_contract', { on_contract })
      .getRawOne();
  }

  getMinMaxMeanGroupBy(field: string) {
    switch (field) {
      case 'dept':
        return this.employeeRepository
          .createQueryBuilder()
          .select('department')
          .select('MIN(salary)', 'min')
          .addSelect('MAX(salary)', 'max')
          .addSelect('AVG(salary)', 'mean')
          .groupBy('department')
          .getRawMany();
      case 'sub-dept':
        return this.employeeRepository
          .createQueryBuilder()
          .select('department')
          .select('sub_department')
          .select('MIN(salary)', 'min')
          .addSelect('MAX(salary)', 'max')
          .addSelect('AVG(salary)', 'mean')
          .groupBy('department')
          .addGroupBy('sub_department')
          .getRawMany();
    }
  }
}
