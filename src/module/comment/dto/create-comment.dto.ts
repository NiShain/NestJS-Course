import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { COMMENT_BODY_MAX_LENGTH } from '../constants/comment.constants.js';

export class CreateCommentPayloadDto {
  @ApiProperty({
    example: 'His name was my name too.',
    maxLength: COMMENT_BODY_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(COMMENT_BODY_MAX_LENGTH)
  body: string;
}

export class CreateCommentDto {
  @ApiProperty({ type: CreateCommentPayloadDto })
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateCommentPayloadDto)
  comment: CreateCommentPayloadDto;
}
