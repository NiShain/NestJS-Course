import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';

export interface E2eTestContext {
  app: INestApplication<App>;
  dataSource: DataSource;
  moduleFixture: TestingModule;
}

//Setup Ee2 testing
export async function createE2eApp(): Promise<E2eTestContext> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();
  const dataSource = app.get(DataSource);

  return { app, dataSource, moduleFixture };
}

//Truncates all tables in the test database for each testcase 
export async function truncateDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    const tables: Array<Record<string, string>> =
      await dataSource.query('SHOW TABLES');

    for (const row of tables) {
      const tableName = Object.values(row)[0];
      if (tableName && tableName !== 'migrations') {
        await dataSource.query(`TRUNCATE TABLE \`${tableName}\``);
      }
    }
  } finally {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}
