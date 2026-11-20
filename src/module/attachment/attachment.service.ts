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
        userId: number,
    ): Promise<{ attachment: Attachment; oldAttachment: Attachment | null }> {
        const attachableType = 'User';
        const attachableId = String(userId);

        const oldAttachment = await this.attachmentRepository.findOne({
            where: {
                attachable_type: attachableType,
                attachable_id: attachableId,
            },
        });

        const newAttachment = this.attachmentRepository.create({
            url: `/public/uploads/avatars/${file.filename}`,
            file_name: file.filename,
            file_type: file.mimetype,
            file_size: file.size,
            attachable_type: attachableType,
            attachable_id: attachableId,
        });

        const attachment = await this.attachmentRepository.save(newAttachment);

        return { attachment, oldAttachment };
    }

    async removeAttachment(attachment: Attachment): Promise<void> {
        const filePath = join(process.cwd(), attachment.url);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await this.attachmentRepository.remove(attachment);
    }

    async rollbackAttachment(
        attachment: Attachment,
        filePath: string,
    ): Promise<void> {
        await this.attachmentRepository.remove(attachment);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}