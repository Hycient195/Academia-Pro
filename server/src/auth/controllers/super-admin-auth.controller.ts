import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Response } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dtos';

@Controller('super-admin/auth')
export class SuperAdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async superAdminLogin(@Body() loginDto: LoginDto, @Response() res: any): Promise<void> {
    // Validate that this is a super admin login attempt
    const user = await this.authService.validateSuperAdmin(loginDto.email, loginDto.password);

    if (!user) {
      throw new Error('Invalid super admin credentials');
    }

    // Use cookie-based authentication
    const result = await this.authService.loginWithCookies(user, res);

    res.json(result);
  }
}