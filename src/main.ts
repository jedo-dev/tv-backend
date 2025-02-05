import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Разрешает запросы с любых источников
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешенные методы
    allowedHeaders: 'Content-Type, Authorization', // Разрешенные заголовки
    credentials: true, // Разрешает передачу cookies и заголовков авторизации
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
