import {
    Body,
    Controller,
    Header,
    Post,
    Req,
    UnauthorizedException,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/regitster.dto.js';
import { JwtAuthGuard } from './guards/auth.guard.js';
@ApiTags('auth')
@Controller('/api/users')
export class AuthController{
    constructor(private readonly authService: AuthService) {}

    @Post()
    async register(@Body() reigsterDto: RegisterDto ){
        return this.authService.register(reigsterDto.user)
    }

    @Post('login')
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.user);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    async logout(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
        throw new UnauthorizedException('Token not found');
        }
    return this.authService.logout(token);
  }
}