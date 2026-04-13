import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

const REPORT_ROLES = ['admin', 'accountant', 'store-manager'] as const;

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // T030 — GET /reports/daily?date=YYYY-MM-DD
  @Get('daily')
  @Roles(...REPORT_ROLES)
  @ApiOperation({ summary: 'Daily revenue & VAT report for caller\'s store' })
  @ApiQuery({ name: 'date', required: true, example: '2026-04-13' })
  async daily(
    @CurrentUser() user: AuthUser,
    @Query('date') date?: string,
  ) {
    if (!user.storeId) throw new ForbiddenException('Store assignment required');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date query param required (YYYY-MM-DD)');
    }
    return this.reportsService.getDailyReport(user.storeId, date);
  }

  // T031 — GET /reports/monthly?year=YYYY&month=MM
  @Get('monthly')
  @Roles(...REPORT_ROLES)
  @ApiOperation({ summary: 'Monthly revenue & VAT report for caller\'s store' })
  @ApiQuery({ name: 'year', required: true, example: 2026 })
  @ApiQuery({ name: 'month', required: true, example: 4 })
  async monthly(
    @CurrentUser() user: AuthUser,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    if (!user.storeId) throw new ForbiddenException('Store assignment required');
    const y = parseInt(year ?? '', 10);
    const m = parseInt(month ?? '', 10);
    if (!year || !month || isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      throw new BadRequestException('year and month query params required');
    }
    return this.reportsService.getMonthlyReport(user.storeId, y, m);
  }

  // T032 — GET /reports/invoices/export?from=YYYY-MM-DD&to=YYYY-MM-DD → CSV
  @Get('invoices/export')
  @Roles(...REPORT_ROLES)
  @ApiOperation({ summary: 'Export invoices as CSV (BR-RPT-04)' })
  @ApiQuery({ name: 'from', required: true, example: '2026-04-01' })
  @ApiQuery({ name: 'to', required: true, example: '2026-04-13' })
  async exportCsv(
    @CurrentUser() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Res() res?: Response,
  ) {
    if (!user.storeId) throw new ForbiddenException('Store assignment required');
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!from || !to || !dateRe.test(from) || !dateRe.test(to)) {
      throw new BadRequestException('from and to query params required (YYYY-MM-DD)');
    }
    const csv = await this.reportsService.exportCsv(user.storeId, from, to);
    res!.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res!.setHeader(
      'Content-Disposition',
      `attachment; filename="invoices-${from}-${to}.csv"`,
    );
    res!.send(csv);
  }

  // For /dashboard — last 7 days revenue
  @Get('dashboard/weekly')
  @Roles(...REPORT_ROLES)
  @ApiOperation({ summary: 'Last 7-day revenue per day for dashboard chart' })
  async weeklyRevenue(@CurrentUser() user: AuthUser) {
    if (!user.storeId) throw new ForbiddenException('Store assignment required');
    return this.reportsService.getLast7Days(user.storeId);
  }
}
