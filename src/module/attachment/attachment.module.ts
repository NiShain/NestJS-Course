import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentService } from './attachment.service.js';
import { Attachment } from './entities/attachment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [AttachmentService],
  exports: [AttachmentService, TypeOrmModule],
})
export class AttachmentModule {}