import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { LoggingModule } from "./common/logging/logging.module";
import { CoursePackModule } from "./course-pack/course-pack.module";
import { DatabaseModule } from "./database/database.module";
import { UserModule } from "./user/user.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    LoggingModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    CoursePackModule,
    AiModule,
  ],
})
export class AppModule {}
