import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { Article } from '../src/module/article/entities/article.entity.js';
import { Comment } from '../src/module/comment/entities/comment.entity.js';
import { User } from '../src/module/user/entities/user.entity.js';
import { createE2eApp, truncateDatabase } from './helpers/e2e-setup.js';
import {
  createFollowRelation,
  createTestArticle,
  createTestComment,
  createTestUser,
  generateAuthToken,
} from './helpers/test-data.helper.js';

describe('CommentController (e2e - C2 coverage)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  //reset fake data for each testcase
  let author: User;
  let otherUser: User;
  let authorToken: string;
  let otherUserToken: string;
  let article: Article;

  beforeAll(async () => {
    const ctx = await createE2eApp();
    app = ctx.app;
    dataSource = ctx.dataSource;
  });

  //fake clean data
  beforeEach(async () => {
    author = await createTestUser(dataSource, {
      username: 'author_user',
      email: 'author@example.com',
      bio: 'Author bio',
    });
    otherUser = await createTestUser(dataSource, {
      username: 'other_user',
      email: 'other@example.com',
    });

    authorToken = generateAuthToken(app, author);
    otherUserToken = generateAuthToken(app, otherUser);

    article = await createTestArticle(dataSource, author.id, {
      slug: 'nestjs-e2e-guide',
      title: 'NestJS E2E Guide',
    });
  });

  //Truncates all tables in the test database for each testcase
  afterEach(async () => {
    await truncateDatabase(dataSource);
  });

  //close app
  afterAll(async () => {
    await app?.close();
  });

  describe('POST /api/articles/:slug/comments', () => {
    it('201 - should create a comment when authenticated with valid payload', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ comment: { body: 'Great article!' } })
        .expect(201);

      // check response route
      expect(response.body.comment).toMatchObject({
        id: expect.any(Number),
        body: 'Great article!',
        author: {
          username: otherUser.username,
          bio: null,
          image: null,
          following: false,
        },
      });
      expect(response.body.comment.createdAt).toBeDefined();
      expect(response.body.comment.updatedAt).toBeDefined();

      // check if data was written into database
      const savedInDb = await dataSource
        .getRepository(Comment)
        .findOneBy({ id: response.body.comment.id });
      expect(savedInDb).not.toBeNull();
      expect(savedInDb?.body).toBe('Great article!');
      expect(savedInDb?.articleId).toBe(article.id);
      expect(savedInDb?.authorId).toBe(otherUser.id);
    });

    it('400 - should fail when comment object is missing from request body', async () => {
      await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({})
        .expect(400);
    });

    it('400 - should fail when comment.body is empty', async () => {
      await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: { body: '' } })
        .expect(400);
    });

    it('400 - should fail when comment.body is not a string', async () => {
      await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: { body: 12345 } })
        .expect(400);
    });

    it('401 - should fail when unauthenticated (no token provided)', async () => {
      await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .send({ comment: { body: 'Unauthorized comment' } })
        .expect(401);
    });

    it('401 - should fail when an invalid token is provided', async () => {
      await request(app.getHttpServer())
        .post(`/api/articles/${article.slug}/comments`)
        .set('Authorization', 'Bearer invalid.jwt.token')
        .send({ comment: { body: 'Invalid token comment' } })
        .expect(401);
    });

    it('404 - should fail when the article slug does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/articles/non-existent-slug/comments')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ comment: { body: 'Comment on missing article' } })
        .expect(404);
    });
  });

  describe('GET /api/articles/:slug/comments', () => {
    it('200 - should return an empty array when the article has no comments', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}/comments`)
        .expect(200);

      expect(response.body).toEqual({ comments: [] });
    });

    it('200 - should return comments with following=false when unauthenticated', async () => {
      await createTestComment(dataSource, article.id, author.id, {
        body: 'First comment',
      });
      await createTestComment(dataSource, article.id, otherUser.id, {
        body: 'Second comment',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}/comments`)
        .expect(200);

      expect(response.body.comments).toHaveLength(2);
      for (const item of response.body.comments) {
        expect(item.author.following).toBe(false);
      }
    });

    it('200 - should allow access and return following=false when an invalid token is provided (OptionalJwtAuthGuard)', async () => {
      await createTestComment(dataSource, article.id, author.id, {
        body: 'Public comment',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}/comments`)
        .set('Authorization', 'Bearer wrong-token')
        .expect(200);

      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].author.following).toBe(false);
    });

    it('200 - should distinguish author.following=true and false when authenticated', async () => {
      // fake another user to check follow feature
      const thirdUser = await createTestUser(dataSource, {
        username: 'third_user',
        email: 'third@example.com',
      });

      await createFollowRelation(dataSource, otherUser.id, author.id);

      await createTestComment(dataSource, article.id, author.id, {
        body: 'Comment by followed author',
      });
      await createTestComment(dataSource, article.id, thirdUser.id, {
        body: 'Comment by unfollowed user',
      });

      const response = await request(app.getHttpServer())
        .get(`/api/articles/${article.slug}/comments`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.comments).toHaveLength(2);

      const commentByAuthor = response.body.comments.find(
        (c: { author: { username: string } }) =>
          c.author.username === author.username,
      );
      const commentByThird = response.body.comments.find(
        (c: { author: { username: string } }) =>
          c.author.username === thirdUser.username,
      );

      expect(commentByAuthor?.author.following).toBe(true);
      expect(commentByThird?.author.following).toBe(false);
    });

    it('404 - should fail when the article slug does not exist', async () => {
      await request(app.getHttpServer())
        .get('/api/articles/non-existent-slug/comments')
        .expect(404);
    });
  });

  describe('DELETE /api/articles/:slug/comments/:id', () => {
    it('200 - should delete the comment when requested by its author and remove it from DB', async () => {
      const comment = await createTestComment(
        dataSource,
        article.id,
        otherUser.id,
        { body: 'Comment to delete' },
      );

      const response = await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body).toEqual({});

      const deleted = await dataSource
        .getRepository(Comment)
        .findOneBy({ id: comment.id });
      expect(deleted).toBeNull();
    });

    it('400 - should fail when :id param is not a valid integer (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/comments/not-a-number`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(400);
    });

    it('401 - should fail when unauthenticated (no token provided)', async () => {
      const comment = await createTestComment(
        dataSource,
        article.id,
        author.id,
      );

      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
        .expect(401);
    });

    it('403 - should fail when another user attempts to delete the comment', async () => {
      const comment = await createTestComment(
        dataSource,
        article.id,
        author.id,
        { body: 'Protected comment' },
      );

      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/comments/${comment.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      const stillExists = await dataSource
        .getRepository(Comment)
        .findOneBy({ id: comment.id });
      expect(stillExists).not.toBeNull();
    });

    it('404 - should fail when the article slug does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/api/articles/non-existent-slug/comments/1')
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(404);
    });

    it('404 - should fail when comment ID does not exist on the article', async () => {
      await request(app.getHttpServer())
        .delete(`/api/articles/${article.slug}/comments/999999`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(404);
    });

    it('404 - should fail when the comment exists but belongs to another article', async () => {
      const anotherArticle = await createTestArticle(dataSource, author.id, {
        slug: 'another-article',
      });
      const commentOnAnotherArticle = await createTestComment(
        dataSource,
        anotherArticle.id,
        author.id,
      );

      // Delete anotherArticle's comment via currentArticle's slug
      await request(app.getHttpServer())
        .delete(
          `/api/articles/${article.slug}/comments/${commentOnAnotherArticle.id}`,
        )
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(404);
    });
  });
});
