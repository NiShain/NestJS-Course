import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListArticleDto {
    @ApiPropertyOptional({ example: 'reactjs' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ example: 'jake' })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiPropertyOptional({ example: 'jake' })
    @IsOptional()
    @IsString()
    favorited?: string;

    @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({ default: 0, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}