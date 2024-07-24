import { Controller, Get, Query } from '@nestjs/common';
import { EmployeeSummaryStatsService } from './employee-summary-stats.service';
import { FilterSummaryStatsDto } from './dto/filter-summary-stats.dto';

@Controller('employee-summary-stats')
export class EmployeeSummaryStatsController {
  constructor(
    private readonly employeeSummaryStatsService: EmployeeSummaryStatsService,
  ) {}

  @Get()
  aggregateAll(@Query() query: FilterSummaryStatsDto) {
    if (query) {
      return this.employeeSummaryStatsService.getMinMaxMeanFilterBy(query);
    }
    return this.employeeSummaryStatsService.getMinMaxMean();
  }

  @Get('by-department')
  aggregateByDepartment() {
    return this.employeeSummaryStatsService.getMinMaxMeanGroupBy('dept');
  }

  @Get('by-sub-department')
  aggregateBySubDepartment() {
    return this.employeeSummaryStatsService.getMinMaxMeanGroupBy('sub-dept');
  }
}
