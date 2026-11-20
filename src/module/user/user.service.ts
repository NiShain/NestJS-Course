import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { Repository } from 'typeorm';
import { BCRYPT_SALT_ROUNDS } from '../../auth/constants/auth.constants.js';
import { AttachmentService } from '../attachment/attachment.service.js';
import { UpdateDto } from './dto/update.dto.js';
import { User } from './entities/user.entity.js';
@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User) 
        private readonly userRepo: Repository<User>,
        private readonly attachmentService : AttachmentService,
    ) {}

    async updateUser(
        userId: number,
        updateDto: UpdateDto,
        token: string,
        file?: Express.Multer.File,
    ) {
        const user = await this.userRepo.findOne({ where: { id: userId}});
        if (!user){
            throw new NotFoundException('User not found.');
        }

        if (updateDto.email && updateDto.email !== user.email){
            const  emailExist = await this.userRepo.findOne({ 
                where: {email: updateDto.email},
            });
            if (emailExist) {
                throw new ConflictException('Emails already exist');
            }
            user.email = updateDto.email;
        }

        if (updateDto.username && updateDto.username !== user.username){
            const usernameExist = await this.userRepo.findOne( {where: {
                username: updateDto.username
            }});
            if (usernameExist){
                throw new ConflictException("Username already used.");
            }
            user.username = updateDto.username;            
        }

        if (updateDto.password) {
            user.password = await bcrypt.hash(updateDto.password, BCRYPT_SALT_ROUNDS);
    }
        if (updateDto.bio !== undefined) {
            user.bio = updateDto.bio;
        }
        let newAttachment: Awaited<
            ReturnType<AttachmentService['updateUserAvatar']>
        > | null = null;

        try {
            if (file) {
                newAttachment = await this.attachmentService.updateUserAvatar(
                    file,
                    user.id,
                );

                user.image = newAttachment.attachment.url;
            } else if (updateDto.image !== undefined) {
                user.image = updateDto.image;
            }

            const updatedUser = await this.userRepo.save(user);

            if (newAttachment?.oldAttachment) {
                await this.attachmentService.removeAttachment(
                    newAttachment.oldAttachment,
                );
            }

            return {
                user: {
                    email: updatedUser.email,
                    token,
                    username: updatedUser.username,
                    bio: updatedUser.bio,
                    image: updatedUser.image,
                },
            };
        } catch (error) {
            if (newAttachment && file) {
                await this.attachmentService.rollbackAttachment(
                    newAttachment.attachment,
                    file.path,
                );
            } else if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            throw error;
        }

    }

    async findById (id: number): Promise<User> {
        const user = await this.userRepo.findOne({ where: {id}})
        if (!user){
            throw new NotFoundException("User's Id not found");
        }
        return user;
    }
    
    async findByEmail(email: string): Promise<User | null>{
        return this.userRepo
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
    } 

    async findByUsername(username :string): Promise<User>{
        const user = await this.userRepo.findOne( { where: {username}});
        if (!user){
            throw new NotFoundException("username no found");
        }
        return user;
    }

    async create(data:{
        username: string;
        email: string;
        password: string;
    }): Promise<User>{
        const newUser = this.userRepo.create(data);
        return this.userRepo.save(newUser);
    }

    buildUserResponse(user: User, token: string){
        return{
            user: {
                email: user.email,
                token,
                username: user.username,
                bio: user.bio,
                image: user.image
            }
        }
    }

}
