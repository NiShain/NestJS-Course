import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsNotEmptyObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class CreateArticlePayloadDto {
    @ApiProperty({ example: 'How to train your dragon' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Ever wonder how?' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'You have to believe' })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({ example: ['reactjs', 'angularjs', 'dragons'], type: [String], required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tagList?: string[];
}

export class CreateArticleDto {
    @ApiProperty({ type: CreateArticlePayloadDto })
    @IsDefined()
    @IsNotEmptyObject()
    @ValidateNested()
    @Type(() => CreateArticlePayloadDto)
    article: CreateArticlePayloadDto;
}