import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity.js';
import { ProfileDto } from './dto/profile.dto.js';

@Injectable()
export class ProfileService{
    constructor(
        @InjectRepository(User)
        private readonly userReposity: Repository<User>,
    ) {}
    private async checkFollowing(
        targetUserId: number,
        currentUserId?: number,
    ): Promise<boolean>{
        if(!currentUserId || currentUserId === targetUserId) return false;

        const count = await this.userReposity
        .createQueryBuilder('user')
        .innerJoin(
            'user.followers',
            'follower', 
            'follower.id = :currentUserId', 
            {currentUserId,}
        )
        .where('user.id = :targetUserId', { targetUserId })
        .getCount();

    return count > 0;
    }

    async getProfile(
        username: string,
        currentUserId?:number,
    ): Promise<ProfileDto> {
        const targetUser = await this.userReposity.findOne( {where: {username}});
        if (!targetUser) {
            throw new NotFoundException('Profile not found bro...');
        }
        const isFollowing = await this.checkFollowing(
            targetUser.id,
            currentUserId,
        );
        return this.buildProfileResponse(targetUser, isFollowing);
    }

    async followUser(
        username: string,
        currentUserId: number,
    ): Promise<ProfileDto>{
        const targetUser = await this.userReposity.findOne({
            where: { username },
        });

        if (!targetUser) {
            throw new NotFoundException('Profile not found');
        }

        if (targetUser.id === currentUserId) {
            throw new BadRequestException('Why you want to follow yourself? Lmao');
        }

        const alreadyFollowing = await this.checkFollowing(
            targetUser.id,
            currentUserId,
        );

        if (!alreadyFollowing) {
        await this.userReposity
            .createQueryBuilder()
            .relation(User, 'followers')
            .of(targetUser.id)
            .add(currentUserId);
        }

        return this.buildProfileResponse(targetUser, true);
    }
    async unfollowUser(
        username: string,
        currentUserId: number,
    ): Promise<ProfileDto> {
        const targetUser = await this.userReposity.findOne({
            where: { username },
        });

        if (!targetUser) {
            throw new NotFoundException('Profile not found');
        }

        if (targetUser.id === currentUserId) {
        throw new BadRequestException('You cannot unfollow yourself');
        }

        await this.userReposity
            .createQueryBuilder()
            .relation(User, 'followers')
            .of(targetUser.id)
            .remove(currentUserId);

        return this.buildProfileResponse(targetUser, false);
    }
    
    buildProfileResponse(
        user: User,
        following: boolean,
    ): ProfileDto {
    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following,
      },
    };
  }
}