import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { Article } from '../../src/module/article/entities/article.entity.js';
import { Comment } from '../../src/module/comment/entities/comment.entity.js';
import { User } from '../../src/module/user/entities/user.entity.js';

let sequence = 0;

function nextSeq(): number {
  sequence += 1;
  return sequence;
}

//fake new user skip register
export async function createTestUser(
  dataSource: DataSource,
  overrides: Partial<User> = {},
): Promise<User> {
  const seq = nextSeq();
  const userRepo = dataSource.getRepository(User);

  const user = userRepo.create({
    username: `user_${seq}`,
    email: `user_${seq}@example.com`,
    password: 'hashed_password_for_test',
    bio: null,
    image: null,
    ...overrides,
  });

  return userRepo.save(user);
}

export function generateAuthToken(
  app: INestApplication<App>,
  user: Pick<User, 'id' | 'email'>,
): string {
  const jwtService = app.get(JwtService);
  return jwtService.sign({ sub: user.id, email: user.email });
}

//create fake article for fake user
export async function createTestArticle(
  dataSource: DataSource,
  authorId: number,
  overrides: Partial<Article> = {},
): Promise<Article> {
  const seq = nextSeq();
  const articleRepo = dataSource.getRepository(Article);

  const article = articleRepo.create({
    slug: `test-article-${seq}`,
    title: `Test Article ${seq}`,
    description: `Description for article ${seq}`,
    body: `Body content for article ${seq}`,
    authorId,
    ...overrides,
  });

  return articleRepo.save(article);
}

//create fake comment
export async function createTestComment(
  dataSource: DataSource,
  articleId: number,
  authorId: number,
  overrides: Partial<Comment> = {},
): Promise<Comment> {
  const seq = nextSeq();
  const commentRepo = dataSource.getRepository(Comment);

  const comment = commentRepo.create({
    body: `Test comment body ${seq}`,
    articleId,
    authorId,
    ...overrides,
  });

  return commentRepo.save(comment);
}

//create relation
export async function createFollowRelation(
  dataSource: DataSource,
  followerId: number,
  followingId: number,
): Promise<void> {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into('user_follows')
    .values({
      follower_id: followerId,
      following_id: followingId,
    })
    .execute();
}
