import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardService, DashboardResult } from './dashboard.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get inventory dashboard summary (low-stock + out-of-stock)' })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  async getSummary(@CurrentUser() user: AuthUser): Promise<DashboardResult> {
    return this.dashboardService.getSummary(user.storeId);
  }
}
