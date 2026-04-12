import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersService } from '../users/users.service';

@ApiTags('auth')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — invalidates refresh token' })
  async logout(@CurrentUser() user: AuthUser): Promise<void> {
    return this.authService.logout(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async me(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id);
  }

  // ─── Admin endpoints ─────────────────────────────────────────────────────

  @Get('users')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all users' })
  @ApiResponse({ status: 200, description: 'Array of user objects' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  async listUsers() {
    return this.usersService.findAll();
  }

  @Post('register')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new user account' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Patch('users/:id/deactivate')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Deactivate a user — flushes their Redis session' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.deactivateUser(id);
  }
}
