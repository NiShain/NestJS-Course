import { BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service.js';

describe('ProfileService', () => {
  const targetUser = {
    id: 2,
    username: 'target',
    bio: null,
    image: null,
  };

  it('keeps follow successful when the relationship already exists', async () => {
    const execute = vi.fn().mockResolvedValue({ identifiers: [] });
    const queryBuilder = {
      insert: vi.fn().mockReturnThis(),
      into: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      orIgnore: vi.fn().mockReturnThis(),
      execute,
    };
    const userRepository = {
      findOne: vi.fn().mockResolvedValue(targetUser),
      createQueryBuilder: vi.fn().mockReturnValue(queryBuilder),
    };
    const service = new ProfileService(userRepository as never);

    const firstResult = await service.followUser('target', 1);
    const secondResult = await service.followUser('target', 1);

    expect(execute).toHaveBeenCalledTimes(2);
    expect(queryBuilder.orIgnore).toHaveBeenCalledTimes(2);
    expect(firstResult.profile.following).toBe(true);
    expect(secondResult.profile.following).toBe(true);
  });

  it('keeps unfollow successful when the relationship does not exist', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const relation = {
      relation: vi.fn().mockReturnThis(),
      of: vi.fn().mockReturnThis(),
      remove,
    };
    const userRepository = {
      findOne: vi.fn().mockResolvedValue(targetUser),
      createQueryBuilder: vi.fn().mockReturnValue(relation),
    };
    const service = new ProfileService(userRepository as never);

    await service.unfollowUser('target', 1);
    await service.unfollowUser('target', 1);

    expect(remove).toHaveBeenCalledTimes(2);
  });

  it('rejects following yourself', async () => {
    const userRepository = {
      findOne: vi.fn().mockResolvedValue({ ...targetUser, id: 1 }),
    };
    const service = new ProfileService(userRepository as never);

    await expect(service.followUser('target', 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
