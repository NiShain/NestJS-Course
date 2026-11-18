import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import 'multer';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity.js';
@Injectable()
export class AttachmentService{
    constructor(
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,  ) {}
    
    async updateUserAvatar(
        file: Express.Multer.File,
        userId: number,): Promise<Attachment>{
            const attachableType = 'User';
            const attachableId = String(userId);

            const oldAttachment = await this.attachmentRepository.findOne({
                where: {
                    attachable_type : attachableType,
                    attachable_id : attachableId,
                },
            });
    
        if (oldAttachment) {
            const oldFilePath = join(process.cwd(), oldAttachment.url);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
            await this.attachmentRepository.remove(oldAttachment);
        }
            const newAttachment = this.attachmentRepository.create({
                url: `/public/uploads/avatars/${file.filename}`,
                file_name: file.filename,
                file_type: file.mimetype,
                file_size: file.size,
                attachable_type: attachableType,
                attachable_id: attachableId,
            });
            return this.attachmentRepository.save(newAttachment);
        }
}