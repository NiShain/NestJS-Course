import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
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
            throw new NotFoundException('User not found bro...');
        }

        if (updateDto.email && updateDto.email !== user.email){
            const  emailExist = await this.userRepo.findOne({ 
                where: {email: updateDto.email},
            });
            if (emailExist) {
                throw new ConflictException('Emails already exist bro...');
            }
            user.email = updateDto.email;
        }

        if (updateDto.username && updateDto.username !== user.username){
            user.username = updateDto.username;            
        }

        if (updateDto.password) {
            user.password = await bcrypt.hash(updateDto.password, 10);
    }
        if (updateDto.bio !== undefined) {
            user.bio = updateDto.bio;
        }
        if (file){
            const attachment = await this.attachmentService.updateUserAvatar(
                file,
                user.id,
            );
            user.image = attachment.url;
        } else if (updateDto.image !== undefined) {
            user.image = updateDto.image;
        }

        const updatedUser = await this.userRepo.save(user);

        return {
            user: {
                email: updatedUser.email,
                token,
                username: updatedUser.username,
                bio: updatedUser.bio,
                image: updatedUser.image,
            }
        }
    }




    async findById (id: number): Promise<User> {
        const user = await this.userRepo.findOne({ where: {id}})
        if (!user){
            throw new NotFoundException("Bro, there's no one with that id here");
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
            throw new NotFoundException("Hehe, no one with that username here");
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
