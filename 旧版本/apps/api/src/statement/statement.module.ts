import { Module } from "@nestjs/common";

import { GlobalModule } from "../global/global.module";
import { CreatorGuard } from "../guards/creator.guard";
import { StatementController } from "./statement.controller";
import { StatementService } from "./statement.service";

@Module({
  imports: [GlobalModule],
  providers: [StatementService, CreatorGuard],
  controllers: [StatementController],
})
export class StatementModule {}
