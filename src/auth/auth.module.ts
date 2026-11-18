import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { UserModule } from '../module/user/user.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JWT_EXPIRES_IN, REDIS_CLIENT } from './constants/auth.constants.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

const DEFAULT_REDIS_PORT = 6379;

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret_key_dev',
        signOptions: { expiresIn: JWT_EXPIRES_IN },
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 5,
    }]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Redis({
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: Number(configService.get<number>('REDIS_PORT') || DEFAULT_REDIS_PORT),
        }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AuthService, 
    JwtStrategy
],
})
export class AuthModule {}