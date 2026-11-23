import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDefined,
    IsNotEmpty,
    IsNotEmptyObject,
    IsString,
    ValidateNested,
} from 'class-validator';

export class CreateCommentPayloadDto {
    @ApiProperty({ example: 'His name was my name too.' })
    @IsString()
    @IsNotEmpty()
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
