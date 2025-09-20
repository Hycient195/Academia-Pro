import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Response, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dtos';

@Controller('super-admin/auth')
export class SuperAdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async superAdminLogin(@Body() loginDto: LoginDto, @Response() res: any): Promise<void> {
    try {
      // Validate that this is a super admin login attempt
      const user = await this.authService.validateSuperAdmin(loginDto.email, loginDto.password);

      const tokens = await this.authService.login(user);

      // Remove sensitive information from response
      const { passwordHash, ...userResponse } = user;

      const result = {
        user: userResponse,
        tokens,
      };

      res.json(result);
    } catch (error) {
      // Re-throw the error to maintain proper HTTP status codes
      throw error;
    }
  }
}