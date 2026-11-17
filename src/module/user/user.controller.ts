import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Header,
    Headers,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AUTH_SCHEME_BEARER } from '../../auth/constants/auth.constants.js';
import { JwtAuthGuard } from '../../auth/guards/auth.guard.js';
import { UpdateDto } from './dto/update.dto.js';
import { UserService } from './user.service.js';
@ApiTags('User')
@Controller('api/user')
export class UserController{
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Put()
    @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    @Header('Pragma', 'no-cache')
    @Header('Expires', '0')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads/avatars';
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận định dạng ảnh jpg, jpeg, png, webp'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, //maximum 10Mb 
    }),
    )
    @ApiBearerAuth()
    async updateUser(
        @Req() req: any,
        @Headers('authorization') authHeader: string,
        @Body() body: any,
        @UploadedFile() file?: Express.Multer.File,
    ){
        const payload: UpdateDto = body?.user ? body.user : body;
        const token = authHeader?.split(' ')[1] || '';

        return this.userService.updateUser(req.user.id, payload, token, file);
    }
    
    


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