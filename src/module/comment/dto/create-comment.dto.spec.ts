import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { COMMENT_BODY_MAX_LENGTH } from '../constants/comment.constants.js';
import { CreateCommentDto } from './create-comment.dto.js';

describe('CreateCommentDto', () => {
  it('accepts a comment body at the maximum length', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      comment: { body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH) },
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a comment body longer than the maximum length', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      comment: { body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH + 1) },
    });

    const errors = await validate(dto);

    expect(errors[0]?.children?.[0]?.constraints).toHaveProperty('maxLength');
  });
});
