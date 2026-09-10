import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DEFAULT_PORT } from "./common/constants";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  // 1. 允许跨域（适配本地前端与各开发端口）
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 2. 开启全局请求参数 DTO 自动校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port);

  logger.log(`🚀 [Earthworm API] 服务端已成功启动在端口: http://localhost:${port}`);
  logger.log(`🔗 核心接口: POST /auth/register, POST /auth/login, GET /user/profile`);
}

bootstrap();
