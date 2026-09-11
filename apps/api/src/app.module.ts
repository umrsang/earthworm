import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { LoggingModule } from "./common/logging/logging.module";
import { DatabaseModule } from "./database/database.module";
import { UserModule } from "./user/user.module";

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
  ],
})
export class AppModule {}
