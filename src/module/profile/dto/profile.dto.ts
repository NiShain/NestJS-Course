import { ApiProperty } from '@nestjs/swagger';

export class ProfileDataDto {
  @ApiProperty({ example: 'jake' })
  username: string;

  @ApiProperty({ example: 'I work at statefarm', nullable: true })
  bio: string | null;

  @ApiProperty({
    example: '/public/uploads/avatars/1700000000-123456.png',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ example: false })
  following: boolean;
}

export class ProfileDto {
  @ApiProperty({ type: ProfileDataDto })
  profile: ProfileDataDto;
}