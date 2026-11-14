import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho phép kết nối từ ngoài
  app.enableCors();

  // Bật Validation tự động cho DTO (class-validator)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Cấu hình Swagger UI
  const config = new DocumentBuilder()
    .setTitle('DucAnh PC API Docs')
    .setDescription('Tài liệu API cho dự án Final Project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api/docs`);
}
bootstrap();