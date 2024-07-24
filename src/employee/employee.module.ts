import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { EmployeeSummaryStatsService } from './employee-summary-stats.service';
import { EmployeeSummaryStatsController } from './employee-summary-stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeeController, EmployeeSummaryStatsController],
  providers: [EmployeeService, EmployeeSummaryStatsService],
})
export class EmployeeModule {}
