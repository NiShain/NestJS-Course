import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { UserService } from '../user/user.service.js';
import {
    DEFAULT_TOKEN_TTL_SECONDS,
    JWT_EXPIRES_IN,
    REDIS_CLIENT
} from './constants/auth.constants.js';
import { LoginPayloadDto } from './dto/login.dto.js';
import { RegisterPayloadDto } from './dto/regitster.dto.js';
@Injectable()
export class AuthService{
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) {}
    //Setup redis
    onModuleDestroy() {
        this.redisClient.disconnect();
    }

    //hash password
    async hashPassword( password: string): Promise<string> {
        return await bcrypt.hash(password, 12);
    }

    //compare user's pass with password param in db
    async comparePassword(
        password: string,
        storePasswordHash: string,
    ): Promise<any> {
        return await bcrypt.compare(password, storePasswordHash);
    }

    async authentication(email: string, password: string): Promise<any>{
        const user = await this.userService.findByEmail(email);
        if (!user){
            return null;
        } 

        const check = await this.comparePassword(password, user.password);
        if (!check){
            return null;
        } 

        return user;
    }
    async register(dto: RegisterPayloadDto) {
        const existingEmail = await this.userService.findByEmail(dto.email);
        if (existingEmail){
            throw new ConflictException("Email already exists");
        }
        const hashedPassword = await this.hashPassword(dto.password);
        const newUser = await this.userService.create({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
        });

        const token = this.jwtService.sign({ sub: newUser.id, email: newUser.email }, { expiresIn: JWT_EXPIRES_IN } );
        return this.userService.buildUserResponse(newUser, token);
    }

    async login(dto: LoginPayloadDto){
        const user = await this.authentication(dto.email, dto.password);
        if (!user){
            throw new UnauthorizedException("Invalid email or password")
        }

        const token = this.jwtService.sign( {sub: user.id, email: user.email }, { expiresIn: JWT_EXPIRES_IN });
        return this.userService.buildUserResponse(user, token);
    }

    async logout(token: string) {
        const decoded = this.jwtService.decode(token) as { exp?: number } | null;
        if (decoded?.exp) {
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
            await this.redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
      }
    }
    return { message: 'Logged out successfully' };
  }

    async invalidateToken(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as { sub?: number; exp?: number } | null;
    const ttl = decoded?.exp
        ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1)
        : DEFAULT_TOKEN_TTL_SECONDS;

    await this.redisClient.set(`blacklist:${token}`, '1', 'EX', ttl);
    if (decoded?.sub) {
      await this.redisClient.del(`session:${decoded.sub}`);
    }
    }

    // Store token to blacklist 
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.redisClient.get(`blacklist:${token}`);
        return result !== null;
  }
}
