
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/auth.guard.js';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-auth.guard.js';
import { ArticleService } from './article.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { FeedArticleDto } from './dto/feed-article.dto.js';
import { ListArticleDto } from './dto/list-article.dto.js';
import { UpdateArticleRequestDto } from './dto/update-article.dto.js';

type AuthenticatedRequest = Request & { user?: { id: number } };

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List articles (Filter by tag, author, favorited)' })
    @ApiResponse({ status: 200, description: 'Return multiple articles, ordered by most recent first' })
    async findAll(
        @Query() dto: ListArticleDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.findAll(dto, req.user?.id);
    }

    @Get('feed')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Feed articles (Articles created by followed users)' })
    @ApiResponse({ status: 200, description: 'Return feed articles for authenticated user' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findFeed(
        @Query() dto: FeedArticleDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.findFeed(dto, req.user!.id);
    }

    @Get(':slug')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get article by slug' })
    @ApiResponse({ status: 200, description: 'Return single article' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async findBySlug(
        @Param('slug') slug: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.findBySlug(slug, req.user?.id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create article' })
    @ApiResponse({ status: 201, description: 'Article created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async create(
        @Body() dto: CreateArticleDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.create(dto.article, req.user!.id);
    }

    @Put(':slug')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update article' })
    @ApiResponse({ status: 200, description: 'Article updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden (Not the author)' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async update(
        @Param('slug') slug: string,
        @Body() dto: UpdateArticleRequestDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.update(slug, dto.article, req.user!.id);
    }

    @Delete(':slug')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete article' })
    @ApiResponse({ status: 200, description: 'Article deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden (Not the author)' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async remove(
        @Param('slug') slug: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.remove(slug, req.user!.id);
    }

    @Post(':slug/favorite')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Favorite article' })
    @ApiResponse({ status: 200, description: 'Article favorited' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async favorite(
        @Param('slug') slug: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.favorite(slug, req.user!.id);
    }

    @Delete(':slug/favorite')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Unfavorite article' })
    @ApiResponse({ status: 200, description: 'Article unfavorited' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async unfavorite(
        @Param('slug') slug: string,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.articleService.unfavorite(slug, req.user!.id);
    }
}