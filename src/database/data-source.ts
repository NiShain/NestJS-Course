import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestjs_course',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/**/migrations/*.js'],
  synchronize: false,
});