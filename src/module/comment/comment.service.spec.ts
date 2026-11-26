import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentService } from './comment.service.js';

describe('CommentService', () => {
  it("forbids deleting another user's comment", async () => {
    const commentRepository = {
      findOne: vi.fn().mockResolvedValue({
        id: 12,
        articleId: 3,
        authorId: 8,
      }),
      remove: vi.fn(),
    };
    const articleRepository = {
      findOne: vi.fn().mockResolvedValue({ id: 3 }),
    };
    const i18n = { t: vi.fn().mockResolvedValue('Forbidden') };
    const service = new CommentService(
      commentRepository as never,
      articleRepository as never,
      {} as never,
      {} as never,
      i18n as never,
    );

    await expect(service.remove('article-slug', 12, 4)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(commentRepository.remove).not.toHaveBeenCalled();
  });

  it('does not delete a comment through a different article slug', async () => {
    const commentRepository = {
      findOne: vi.fn().mockResolvedValue(null),
      remove: vi.fn(),
    };
    const articleRepository = {
      findOne: vi.fn().mockResolvedValue({ id: 6 }),
    };
    const service = new CommentService(
      commentRepository as never,
      articleRepository as never,
      {} as never,
      {} as never,
      { t: vi.fn().mockResolvedValue('Comment not found') } as never,
    );

    await expect(
      service.remove('different-article', 12, 4),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(commentRepository.findOne).toHaveBeenCalledWith({
      where: { id: 12, articleId: 6 },
    });
    expect(commentRepository.remove).not.toHaveBeenCalled();
  });

  it('marks an author as followed by the current viewer', async () => {
    const author = {
      id: 8,
      username: 'author',
      bio: null,
      image: null,
    };
    const commentRepository = {
      find: vi.fn().mockResolvedValue([
        {
          id: 12,
          articleId: 3,
          authorId: author.id,
          body: 'A comment',
          createdAt: new Date(),
          updatedAt: new Date(),
          author,
        },
      ]),
    };
    const articleRepository = {
      findOne: vi.fn().mockResolvedValue({ id: 3 }),
    };
    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getRawMany: vi
        .fn()
        .mockResolvedValue([{ following_id: String(author.id) }]),
    };
    const dataSource = {
      createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
    };
    const service = new CommentService(
      commentRepository as never,
      articleRepository as never,
      {} as never,
      dataSource as never,
      {} as never,
    );

    const result = await service.findAllBySlug('article-slug', 4);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'uf.follower_id = :currentUserId',
      { currentUserId: 4 },
    );
    expect(result.comments[0].author.following).toBe(true);
  });
});
