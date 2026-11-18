import {
  Controller,
  Delete,
  ExecutionContext,
  Get,
  Injectable,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/auth.guard.js';
import { ProfileService } from './profile.service.js';

@Injectable()
class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      return true;
    }
  }
}

type AuthenticatedRequest = Request & { user?: { id: number } };
@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    @UseGuards(OptionalJwtAuthGuard)
    async getProfile(
        @Param('username') username: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.profileService.getProfile(username, req.user?.id);
    }

    @Post(':username/follow')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async followUser(
        @Param('username') username: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.profileService.followUser(username, req.user!.id);
    }

    @Delete(':username/follow')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async unfollowUser(
        @Param('username') username: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.profileService.unfollowUser(username, req.user!.id);
    }
}