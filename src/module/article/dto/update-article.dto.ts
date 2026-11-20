import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNotEmptyObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class UpdateArticleDto {
    @ApiPropertyOptional({ example: 'Did you train your dragon?' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @ApiPropertyOptional({ example: 'Ever wonder how?' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @ApiPropertyOptional({ example: 'You have to believe' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    body?: string;
}

export class UpdateArticleRequestDto { 
    @ApiProperty({ type: UpdateArticleDto })
    @IsDefined()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => UpdateArticleDto)
    article: UpdateArticleDto;
}