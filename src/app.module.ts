import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, 
  HeaderResolver, 
  I18nModule, 
  QueryResolver } from 'nestjs-i18n';
import { join } from 'node:path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: join(import.meta.dirname, 'i18n'),
        watch: true,
      },
    resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
