import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class LoginPayloadDto{
    @ApiProperty({ example: 'jake@jake.jake' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'jakejake' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class LoginDto{
    @ApiProperty({ type: LoginPayloadDto })
    @ValidateNested()
    @Type(() => LoginPayloadDto)
    @IsNotEmpty()
    user: LoginPayloadDto;
}