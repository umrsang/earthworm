import { Body, Controller, Delete, Get, Param, Post, Put, Request, Res, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../auth/admin.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AiModelService } from "./ai-model.service";
import { SaveAiModelDto } from "./dto/ai-model.dto";

interface AnalyzeStatementDto {
  regenerate?: boolean;
}

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin/ai-models")
export class AiModelAdminController {
  constructor(private readonly service: AiModelService) {}
  @Get() list() { return this.service.list(); }
  @Post() create(@Body() dto: SaveAiModelDto) { return this.service.create(dto); }
  @Put(":id") update(@Param("id") id: string, @Body() dto: SaveAiModelDto) { return this.service.update(id, dto); }
  @Put(":id/activate") activate(@Param("id") id: string) { return this.service.activate(id); }
  @Delete(":id") remove(@Param("id") id: string) { return this.service.remove(id); }
}

@UseGuards(JwtAuthGuard)
@Controller("ai-analysis")
export class AiAnalysisController {
  constructor(private readonly service: AiModelService) {}
  /** @param req.user 当前用户上下文 @param statementId 句子 ID @param dto 是否强制重新生成；响应包含分析来源和剩余额度 */
  @Post("statements/:statementId") analyze(@Request() req: any, @Param("statementId") statementId: string, @Body() dto: AnalyzeStatementDto) {
    return this.service.analyzeStatement(req.user.userId, statementId, dto?.regenerate === true);
  }

  /** @param req.user 当前用户上下文 @param statementId 句子 ID @param dto 是否强制重新生成 @param res SSE 响应流 */
  @Post("statements/:statementId/stream")
  analyzeStream(@Request() req: any, @Param("statementId") statementId: string, @Body() dto: AnalyzeStatementDto, @Res() res: any) {
    return this.service.analyzeStatementStream(req.user.userId, statementId, dto?.regenerate === true, res);
  }
}
