import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/auth.guard.js';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-auth.guard.js';
import { CommentService } from './comment.service.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

interface AuthenticatedRequest {
  user: { id: number };
}

interface OptionalAuthRequest {
  user?: { id: number };
}

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a comment to an article' })
    @ApiParam({ name: 'slug', type: String, description: 'Slug of the article' })
    @ApiResponse({ status: 201, description: 'Comment created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async create(
        @Param('slug') slug: string,
        @Req() req: AuthenticatedRequest,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return this.commentService.create(slug, req.user.id, createCommentDto);
    }

    @Get()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all comments from an article' })
    @ApiParam({ name: 'slug', type: String, description: 'Slug of the article' })
    @ApiResponse({ status: 200, description: 'Return all comments for article' })
    @ApiResponse({ status: 404, description: 'Article not found' })
    async findAll(@Param('slug') slug: string, @Req() req: OptionalAuthRequest) {
        return this.commentService.findAllBySlug(slug, req.user?.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a comment from an article' })
    @ApiParam({ name: 'slug', type: String, description: 'Slug of the article' })
    @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden (Not the author of the comment)' })
    @ApiResponse({ status: 404, description: 'Article or Comment not found' })
    async remove(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.commentService.remove(slug, id, req.user.id);
    }
}