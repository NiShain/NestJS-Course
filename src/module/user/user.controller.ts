import {
    Controller,
    Get,
    Header,
    Req,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AUTH_SCHEME_BEARER } from '../../auth/constants/auth.constants.js';
import { JwtAuthGuard } from '../../auth/guards/auth.guard.js';
import { UserService } from './user.service.js';


@ApiTags('User')
@Controller('api/user')
export class UserController{
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Get()
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async getCurrentUser(@Req() req: Request & {user: {id: number}}){
        
        const user = await this.userService.findById(req.user.id);
        let token = '';

        const authorization = req.headers.authorization;

        if (authorization) {
            const parts = authorization.split(' ');
        if (parts.length === 2 && parts[0] === AUTH_SCHEME_BEARER) {
                token = parts[1];
            }
        }   
        return this.userService.buildUserResponse(user, token);
    }
    
    

}