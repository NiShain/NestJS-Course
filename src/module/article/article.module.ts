import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module.js';
import { ProfileModule } from '../profile/profile.module.js';
import { ArticleController } from './article.controller.js';
import { ArticleService } from './article.service.js';
import { Article } from './entities/article.entity.js';
import { Tag } from './entities/tag.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag]),
    ProfileModule,
    AuthModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}