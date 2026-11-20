import { UserService } from './user.service.js';

describe('UserService', () => {
  it('updates user data without replacing the avatar when no file is provided', async () => {
    const user = {
      id: 1,
      email: 'old@example.com',
      username: 'old-user',
      password: 'hashed-password',
      bio: null,
      image: '/old-avatar.png',
    };
    const savedUser = {
      ...user,
      bio: 'Updated bio',
    };
    const userRepository = {
      findOne: vi.fn().mockResolvedValue(user),
      save: vi.fn().mockResolvedValue(savedUser),
    };
    const attachmentService = {
      updateUserAvatar: vi.fn(),
    };
    const service = new UserService(
      userRepository as never,
      attachmentService as never,
    );

    const result = await service.updateUser(
      1,
      { bio: 'Updated bio' },
      'token',
    );

    expect(userRepository.save).toHaveBeenCalledWith({
      ...user,
      bio: 'Updated bio',
    });
    expect(attachmentService.updateUserAvatar).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      bio: 'Updated bio',
      image: '/old-avatar.png',
    });
  });

  it('rejects a duplicate email before handling an uploaded file', async () => {
    const userRepository = {
      findOne: vi
        .fn()
        .mockResolvedValueOnce({
          id: 1,
          email: 'old@example.com',
          username: 'user',
          password: 'hashed-password',
          bio: null,
          image: null,
        })
        .mockResolvedValueOnce({ id: 2 }),
    };
    const attachmentService = {
      updateUserAvatar: vi.fn(),
    };
    const service = new UserService(
      userRepository as never,
      attachmentService as never,
    );

    await expect(
      service.updateUser(1, { email: 'duplicate@example.com' }, 'token'),
    ).rejects.toThrow('Emails already exist');
    expect(attachmentService.updateUserAvatar).not.toHaveBeenCalled();
  });
});
