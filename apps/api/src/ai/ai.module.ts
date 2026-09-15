import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AiAnalysisController, AiModelAdminController } from "./ai-model.controller";
import { AiModelService } from "./ai-model.service";

@Module({ imports: [AuthModule], controllers: [AiModelAdminController, AiAnalysisController], providers: [AiModelService] })
export class AiModule {}
