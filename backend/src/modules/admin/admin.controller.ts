import {
  Controller,
  Get,
  Put,
  Param,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('users')
  @ApiOperation({ summary: '[Admin] List all users (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 403, description: 'Forbidden — ADMIN only' })
  async listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAllPaginated(page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '[Admin] Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Platform stats' })
  async getStats() {
    return this.authService.getAdminStats();
  }

  @Put('users/:id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Disable a user account' })
  @ApiResponse({ status: 200, description: 'User disabled' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async disableUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.authService.setUserStatus(id, false);
    return this.usersService.toAdminUserView(user);
  }

  @Put('users/:id/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Enable a user account' })
  @ApiResponse({ status: 200, description: 'User enabled' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async enableUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.authService.setUserStatus(id, true);
    return this.usersService.toAdminUserView(user);
  }
}
