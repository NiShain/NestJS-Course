import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User) 
        private readonly userRepo: Repository<User>,
    ) {}

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
