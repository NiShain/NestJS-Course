import { ApiProperty } from '@nestjs/swagger';
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

export class RegisterPayloadDto{
    @ApiProperty({ example: 'ThaiBinh' })
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    username: string

    @ApiProperty({ example: 'jake@jake.jake' })
    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    email: string

    @ApiProperty({ example: 'jakejake', minLength: 6 })
    @IsString()
    @MaxLength(255)
    @MinLength(8)
    @IsNotEmpty()
    password: string
}

export class RegisterDto{
    @ApiProperty({ type: RegisterPayloadDto })
    @ValidateNested()
    @Type(() => RegisterPayloadDto)
    @IsNotEmpty()
    user: RegisterPayloadDto;
}