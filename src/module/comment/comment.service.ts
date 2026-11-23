import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { DataSource, Repository } from 'typeorm';
import { Article } from '../article/entities/article.entity.js';
import { User } from '../user/entities/user.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Comment } from './entities/comment.entity.js';

export interface CommentAuthorResponse {
    username: string;
    bio: string | null;
    image: string | null;
    following: boolean;
}

export interface CommentResponseItem {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    body: string;
    author: CommentAuthorResponse;
}

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly i18n: I18nService,
    ) {}

    private async getFollowingAuthorIds(
        currentUserId: number | undefined,
        authorIds: number[],
    ): Promise<Set<number>> {
        if (!currentUserId || authorIds.length === 0) {
            return new Set();
        }
        const uniqueSet = new Set(authorIds);
        const uniqueAuthorIds = Array.from(uniqueSet);
        const rows: Array<{ following_id: number }> = await this.dataSource
            .createQueryBuilder()
            .select('uf.following_id', 'following_id')
            .from('user_follows', 'uf')
            .where('uf.follower_id = :currentUserId', { currentUserId })
            .andWhere('uf.following_id IN (:...uniqueAuthorIds)', { uniqueAuthorIds })
            .getRawMany();

        return new Set(rows.map((row) => Number(row.following_id)));
    }

    async findArticleBySlugOrFail(slug: string): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!article) {
            const message = await this.i18n.t('message.article_not_found', {
                lang: I18nContext.current()?.lang,
            });
            throw new NotFoundException(message);
        }
        return article;
    }

    async findAllBySlug(
        slug: string,
        currentUserId?: number,
    ): Promise<{ comments: CommentResponseItem[] }> {
        const article = await this.findArticleBySlugOrFail(slug);

        const comments = await this.commentRepository.find({
            where: { articleId: article.id },
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });

        if (comments.length === 0) {
            return { comments: [] };
        }

        const followingAuthorIds = await this.getFollowingAuthorIds(
            currentUserId,
            comments.map((c) => c.authorId),
        );

        return {
            comments: comments.map((comment) =>
                this.formatCommentResponse(
                    comment,
                    comment.author,
                    followingAuthorIds.has(comment.authorId),
                ),
            ),
        };
    }

    async create(
        slug: string,
        currentUserId: number,
        createCommentDto: CreateCommentDto,
    ): Promise<{ comment: CommentResponseItem }> {
        const article = await this.findArticleBySlugOrFail(slug);
        const author = await this.userRepository.findOneByOrFail({
            id: currentUserId,
        });

        const newComment = this.commentRepository.create({
            body: createCommentDto.comment.body,
            articleId: article.id,
            authorId: currentUserId,
        });

        const savedComment = await this.commentRepository.save(newComment);

        return {
            comment: this.formatCommentResponse(savedComment, author, false),
        };
    }

    async remove(
        slug: string,
        commentId: number,
        currentUserId: number,
    ): Promise<Record<string, never>> {
        const article = await this.findArticleBySlugOrFail(slug);

        const comment = await this.commentRepository.findOne({
            where: { id: commentId, articleId: article.id },
        });

        if (!comment) {
            const message = await this.i18n.t('message.comment_not_found', {
                lang: I18nContext.current()?.lang,
            });
            throw new NotFoundException(message);
        }

        if (comment.authorId !== currentUserId) {
            const message = await this.i18n.t('message.forbidden_delete_comment', {
                lang: I18nContext.current()?.lang,
            });
            throw new ForbiddenException(message);
        }

        await this.commentRepository.remove(comment);
        return {};
    }

    private formatCommentResponse(
        comment: Comment,
        author: User,
        following: boolean,
    ): CommentResponseItem {
        return {
            id: comment.id,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            body: comment.body,
            author: {
                username: author.username,
                bio: author.bio ?? null,
                image: author.image ?? null,
                following,
            },
        };
    }
}