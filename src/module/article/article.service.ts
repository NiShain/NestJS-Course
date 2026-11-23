import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { ProfileService } from '../profile/profile.service.js';
import { CreateArticlePayloadDto } from './dto/create-article.dto.js';
import { FeedArticleDto } from './dto/feed-article.dto.js';
import { ListArticleDto } from './dto/list-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { Article } from './entities/article.entity.js';
import { Tag } from './entities/tag.entity.js';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        private readonly profileService: ProfileService,
        private readonly i18n: I18nService,
    ) {}

    // Turn title into slug
    private generateSlug(title: string): string {
        const baseSlug = title
            .toLowerCase()
            .normalize('NFD') // remove accents
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/[\s-]+/g, '-');

        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${baseSlug}-${randomSuffix}`;
    }

    private async resolveTags(tagNames?: string[]): Promise<Tag[]> {
        if (!tagNames || tagNames.length === 0) return [];

        // Clear tag whitespace and remove duplicate tags in 1 request
        const cleanTags = tagNames
            .map((t) => t.trim())
            .filter((t) => t !== '');
        const uniqueSet = new Set(cleanTags);
        const uniqueNames = Array.from(uniqueSet);
        if (uniqueNames.length === 0) return [];

        const existingTags = await this.tagRepository.find({
            where: { name: In(uniqueNames) },
        });

        const existingNameSet = new Set(existingTags.map((t) => t.name));
        const newTagNames = uniqueNames.filter((name) => !existingNameSet.has(name));
        const newTags = newTagNames.map((name) =>
            this.tagRepository.create({ name }),
        );

        if (newTags.length > 0) {
            await this.tagRepository.save(newTags);
        }

        return existingTags.concat(newTags);
    }

    private async formArticle(
        article: Article,
        currentUserId?: number,
    ) {
        const favoritesCount = await this.articleRepository.manager
            .createQueryBuilder()
            .from('article_favorites', 'af')
            .where('af.article_id = :articleId', { articleId: article.id })
            .getCount();

        let isFavorited = false;
        if (currentUserId) {
            const favCount = await this.articleRepository.manager
                .createQueryBuilder()
                .from('article_favorites', 'af')
                .where('af.article_id = :articleId', { articleId: article.id })
                .andWhere('af.user_id = :userId', { userId: currentUserId })
                .getCount();
            isFavorited = favCount > 0;
        }

        const isFollowing = await this.profileService.checkFollowing(
            article.author.id,
            currentUserId,
        );
        const { profile } = await this.profileService.buildProfileResponse(
            article.author,
            isFollowing,
        );

        return {
            slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: (article.tags || []).map((tag) => tag.name).sort(),
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            favorited: isFavorited,
            favoritesCount,
            author: profile,
        };
    }

    // Create
    async create(dto: CreateArticlePayloadDto, currentUserId: number) {
        const tags = await this.resolveTags(dto.tagList);

        const article = this.articleRepository.create({
            title: dto.title,
            description: dto.description,
            body: dto.body,
            slug: this.generateSlug(dto.title),
            authorId: currentUserId,
            tags,
        });

        const saved = await this.articleRepository.save(article);
        return this.findBySlug(saved.slug, currentUserId);
    }

    // Get single
    async findBySlug(slug: string, currentUserId?: number) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: {
                author: true,
                tags: true,
            },
        });

        if (!article) {
            throw new NotFoundException('This article not found.');
        }

        return {
            article: await this.formArticle(article, currentUserId),
        };
    }

    // List articles
    async findAll(
        dto: ListArticleDto,
        currentUserId?: number,
    ) {
        const limit = dto.limit ?? 20;
        const offset = dto.offset ?? 0;
        const query = this.articleRepository
            .createQueryBuilder('article')
            .innerJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('article.tags', 'tag');

        if (dto.tag) {
            query.innerJoin(
                'article.tags',
                'filterTag',
                'filterTag.name = :tag',
                { tag: dto.tag },
            );
        }
        if (dto.author) {
            query.andWhere('author.username = :author', { author: dto.author });
        }
        if (dto.favorited) {
            query.innerJoin(
                'article_favorites',
                'favorite',
                'favorite.article_id = article.id',
            );
            query.innerJoin(
                'user',
                'favoriteUser',
                'favoriteUser.id = favorite.user_id',
            );
            query.andWhere('favoriteUser.username = :favorited', {
                favorited: dto.favorited,
            });
        }

        const [articles, articlesCount] = await query
            .orderBy('article.createdAt', 'DESC')
            .addOrderBy('article.id', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return {
            articles: await Promise.all(
                articles.map((article) =>
                    this.formArticle(article, currentUserId),
                ),
            ),
            articlesCount,
        };
    }

    // Feed articles
    async findFeed(
        dto: FeedArticleDto,
        currentUserId: number,
    ) {
        const limit = dto.limit ?? 20;
        const offset = dto.offset ?? 0;
        const [articles, articlesCount] = await this.articleRepository
            .createQueryBuilder('article')
            .innerJoinAndSelect('article.author', 'author')
            .leftJoinAndSelect('article.tags', 'tag')
            .innerJoin(
                'author.followers',
                'follower',
                'follower.id = :currentUserId',
                { currentUserId },
            )
            .orderBy('article.createdAt', 'DESC')
            .addOrderBy('article.id', 'DESC')
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return {
            articles: await Promise.all(
                articles.map((article) =>
                    this.formArticle(article, currentUserId),
                ),
            ),
            articlesCount,
        };
    }

    private async findOwnedArticle(slug: string, currentUserId: number) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true, tags: true },
        });

        if (!article) {
            throw new NotFoundException('This article not found.');
        }
        if (article.authorId !== currentUserId) {
            throw new ForbiddenException('You cannot modify this article.');
        }
        return article;
    }

    // Update
    async update(
        slug: string,
        dto: UpdateArticleDto,
        currentUserId: number,
    ) {
        const article = await this.findOwnedArticle(slug, currentUserId);

        if (dto.title !== undefined) {
            article.title = dto.title;
            article.slug = this.generateSlug(dto.title);
        }
        if (dto.description !== undefined) {
            article.description = dto.description;
        }
        if (dto.body !== undefined) {
            article.body = dto.body;
        }

        await this.articleRepository.save(article);
        return this.findBySlug(article.slug, currentUserId);
    }

    // Delete
    async remove(slug: string, currentUserId: number) {
        const article = await this.findOwnedArticle(slug, currentUserId);
        await this.articleRepository.remove(article);
        return {};
    }

    // Favorite
    async favorite(slug: string, currentUserId: number) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true, tags: true },
        });
        if (!article) {
            throw new NotFoundException('This article not found.');
        }

        await this.articleRepository
            .createQueryBuilder()
            .insert()
            .into('article_favorites')
            .values({
                article_id: article.id,
                user_id: currentUserId,
            })
            .orIgnore()
            .execute();

        return {
            article: await this.formArticle(article, currentUserId),
        };
    }

    // Unfavorite
    async unfavorite(slug: string, currentUserId: number) {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: { author: true, tags: true },
        });
        if (!article) {
            throw new NotFoundException('This article not found.');
        }

        await this.articleRepository
            .createQueryBuilder()
            .delete()
            .from('article_favorites')
            .where('article_id = :articleId', { articleId: article.id })
            .andWhere('user_id = :userId', { userId: currentUserId })
            .execute();

        return {
            article: await this.formArticle(article, currentUserId),
        };
    }
}