import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../article/entities/article.entity.js';
import { User } from '../user/entities/user.entity.js';
import { CommentController } from './comment.controller.js';
import { CommentService } from './comment.service.js';
import { Comment } from './entities/comment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Article, User])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
