import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { createId, getCurrentDialect, getUnderlyingClient, type Client, type Pool } from "@jufun/db";
import { AI_CONSTANTS, ERROR_MESSAGES } from "../common/constants";
import type { SaveAiModelDto } from "./dto/ai-model.dto";

interface ModelRow {
  id: string;
  name: string;
  base_url: string;
  model: string;
  api_key: string;
  is_active: number;
  created_at: string | number;
  updated_at: string | number;
}

interface StatementRow {
  id: string;
  english: string;
  chinese: string;
}

type DatabaseArgument = string | number | Date | null;

export interface AiStatementAnalysis {
  statementId: string;
  english: string;
  chinese: string;
  wordMnemonics: Array<{ word: string; mnemonic: string }>;
  sentenceAnalysis: string;
}

@Injectable()
export class AiModelService {
  list() {
    return this.query<ModelRow>("SELECT * FROM ai_model_configs ORDER BY is_active DESC, created_at DESC", []).then((rows) => rows.map((row) => this.toPublicModel(row)));
  }

  /** @param dto 模型名称、OpenAI 兼容接口地址、模型标识、密钥和启用状态 */
  async create(dto: SaveAiModelDto) {
    if (!dto.apiKey?.trim()) throw new BadRequestException(ERROR_MESSAGES.AI_MODEL_API_KEY_REQUIRED);
    const id = createId();
    const now = this.nowValue();
    if (dto.isActive) await this.deactivateAll();
    await this.execute(
      "INSERT INTO ai_model_configs (id, name, base_url, model, api_key, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, dto.name.trim(), this.normalizeBaseUrl(dto.baseUrl), dto.model.trim(), dto.apiKey.trim(), dto.isActive ? 1 : 0, now, now],
    );
    return this.findPublicModel(id);
  }

  /** @param id 模型配置 ID @param dto 要更新的模型配置，apiKey 留空时保留原值 */
  async update(id: string, dto: SaveAiModelDto) {
    const current = await this.findModel(id);
    if (dto.isActive) await this.deactivateAll();
    await this.execute(
      "UPDATE ai_model_configs SET name = ?, base_url = ?, model = ?, api_key = ?, is_active = ?, updated_at = ? WHERE id = ?",
      [dto.name.trim(), this.normalizeBaseUrl(dto.baseUrl), dto.model.trim(), dto.apiKey?.trim() || current.api_key, dto.isActive ? 1 : 0, this.nowValue(), id],
    );
    return this.findPublicModel(id);
  }

  /** @param id 要设为当前生效项的模型配置 ID */
  async activate(id: string) {
    await this.findModel(id);
    await this.deactivateAll();
    await this.execute("UPDATE ai_model_configs SET is_active = 1, updated_at = ? WHERE id = ?", [this.nowValue(), id]);
    return this.findPublicModel(id);
  }

  /** @param id 要删除的模型配置 ID */
  async remove(id: string) {
    await this.findModel(id);
    await this.execute("DELETE FROM ai_model_configs WHERE id = ?", [id]);
    return { id };
  }

  /** @param userId 当前用户 ID @param statementId 句子 ID @param regenerate 是否强制重新生成 */
  async analyzeStatement(userId: string, statementId: string, regenerate = false) {
    const { statement, activeModel, generationCount } = await this.getAnalysisContext(userId, statementId);
    if (!regenerate) {
      const cached = await this.findCachedAnalysis(userId, statementId, activeModel.id, generationCount);
      if (cached) return cached;
    } else if (generationCount >= AI_CONSTANTS.MAX_STATEMENT_REGENERATIONS) {
      throw new BadRequestException(ERROR_MESSAGES.AI_REGENERATION_LIMIT_REACHED);
    }

    const [item] = await this.requestAnalysis(activeModel, [statement]);
    if (regenerate) return this.savePersonalAnalysis(userId, statementId, activeModel, item);
    await this.saveSystemAnalysis(statementId, activeModel.id, item);
    return this.buildAnalysisResponse(activeModel.name, item, "generated", generationCount);
  }

  /**
   * 单句流式 AI 分析，使用 Server-Sent Events 持续推送生成内容。
   * @param userId 当前用户 ID
   * @param statementId 句子 ID
   * @param regenerate 是否强制重新生成
   * @param res Express/Fastify 响应对象
   */
  async analyzeStatementStream(userId: string, statementId: string, regenerate: boolean, res: any) {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const sendError = (message: string) => { send("error", { message }); res.end(); };

    try {
      const { statement, activeModel, generationCount } = await this.getAnalysisContext(userId, statementId);
      if (!regenerate) {
        const cached = await this.findCachedAnalysis(userId, statementId, activeModel.id, generationCount);
        if (cached) { send("done", cached); res.end(); return; }
      } else if (generationCount >= AI_CONSTANTS.MAX_STATEMENT_REGENERATIONS) {
        return sendError(ERROR_MESSAGES.AI_REGENERATION_LIMIT_REACHED);
      }

      const response = await fetch(`${activeModel.base_url}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${activeModel.api_key}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(AI_CONSTANTS.REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          model: activeModel.model,
          stream: true,
          temperature: 0.3,
          messages: [
            { role: "system", content: "你是英语教师。只输出 JSON：{\"items\":[{\"statementId\":\"\",\"english\":\"\",\"chinese\":\"\",\"wordMnemonics\":[{\"word\":\"\",\"mnemonic\":\"\"}],\"sentenceAnalysis\":\"\"}]}。为每句挑选值得学习的单词并用中文给出简洁助记，句子分析用中文说明语法结构、关键搭配和表达逻辑。必须保留输入的 statementId。" },
            { role: "user", content: JSON.stringify([statement]) },
          ],
        }),
      });
      if (!response.ok) return sendError(`${ERROR_MESSAGES.AI_MODEL_REQUEST_FAILED} (${response.status})`);
      const reader = response.body?.getReader();
      if (!reader) return sendError(ERROR_MESSAGES.AI_MODEL_REQUEST_FAILED);

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const dataStr = line.trim().startsWith("data:") ? line.trim().slice(5).trim() : "";
          if (!dataStr || dataStr === "[DONE]") continue;
          try {
            const payload = JSON.parse(dataStr);
            const delta = payload?.choices?.[0]?.delta?.content ?? payload?.choices?.[0]?.message?.content ?? "";
            if (delta) { fullContent += delta; send("delta", { delta }); }
          } catch {
            // 忽略单个流数据块的解析异常，最终统一校验完整内容。
          }
        }
      }

      const parsed = JSON.parse(this.cleanModelJson(fullContent));
      if (!Array.isArray(parsed.items) || parsed.items.length === 0) throw new Error(ERROR_MESSAGES.AI_MODEL_RESPONSE_INVALID);
      const item = parsed.items[0] as AiStatementAnalysis;
      const result = regenerate
        ? await this.savePersonalAnalysis(userId, statementId, activeModel, item)
        : (await this.saveSystemAnalysis(statementId, activeModel.id, item), this.buildAnalysisResponse(activeModel.name, item, "generated", generationCount));
      send("done", result);
      res.end();
    } catch (error: any) {
      sendError(error?.message || ERROR_MESSAGES.AI_MODEL_RESPONSE_INVALID);
    }
  }

  private async getAnalysisContext(userId: string, statementId: string) {
    const [statement] = await this.query<StatementRow>(
      `SELECT s.id, s.english, s.chinese FROM statements s
       INNER JOIN courses c ON c.id = s.course_id
       INNER JOIN course_packs cp ON cp.id = c.course_pack_id
       WHERE s.id = ? AND cp.creator_id = ? LIMIT 1`,
      [statementId, userId],
    );
    if (!statement) throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
    const [activeModel] = await this.query<ModelRow>("SELECT * FROM ai_model_configs WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1", []);
    if (!activeModel) throw new BadRequestException(ERROR_MESSAGES.AI_MODEL_REQUIRED);
    const [personal] = await this.query<{ generation_count: number }>(
      "SELECT generation_count FROM user_statement_ai_analyses WHERE user_id = ? AND statement_id = ? LIMIT 1",
      [userId, statementId],
    );
    return { statement, activeModel, generationCount: Number(personal?.generation_count || 0) };
  }

  private async findCachedAnalysis(userId: string, statementId: string, modelConfigId: string, generationCount: number) {
    const [personal] = await this.query<{ content: string; model_name: string }>(
      "SELECT content, model_name FROM user_statement_ai_analyses WHERE user_id = ? AND statement_id = ? LIMIT 1",
      [userId, statementId],
    );
    if (personal) return this.buildAnalysisResponse(personal.model_name, JSON.parse(personal.content), "personal", generationCount);
    const [system] = await this.query<{ content: string }>(
      "SELECT content FROM system_statement_ai_analyses WHERE statement_id = ? AND model_config_id = ? LIMIT 1",
      [statementId, modelConfigId],
    );
    if (!system) return null;
    const [model] = await this.query<ModelRow>("SELECT * FROM ai_model_configs WHERE id = ? LIMIT 1", [modelConfigId]);
    return this.buildAnalysisResponse(model.name, JSON.parse(system.content), "system", generationCount);
  }

  private buildAnalysisResponse(modelName: string, item: AiStatementAnalysis, source: "personal" | "system" | "generated", generationCount: number) {
    const remainingGenerations = Math.max(0, AI_CONSTANTS.MAX_STATEMENT_REGENERATIONS - generationCount);
    return { cached: source !== "generated", source, modelName, item, generationCount, remainingGenerations, canRegenerate: remainingGenerations > 0 };
  }

  private async saveSystemAnalysis(statementId: string, modelConfigId: string, item: AiStatementAnalysis) {
    const now = this.nowValue();
    const sql = getCurrentDialect() === "mysql"
      ? "INSERT INTO system_statement_ai_analyses (id, statement_id, model_config_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = VALUES(updated_at)"
      : "INSERT INTO system_statement_ai_analyses (id, statement_id, model_config_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(statement_id, model_config_id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at";
    await this.execute(sql, [createId(), statementId, modelConfigId, JSON.stringify(item), now, now]);
  }

  private async savePersonalAnalysis(userId: string, statementId: string, model: ModelRow, item: AiStatementAnalysis) {
    const now = this.nowValue();
    const sql = getCurrentDialect() === "mysql"
      ? `INSERT INTO user_statement_ai_analyses (id, user_id, statement_id, model_config_id, model_name, content, generation_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?) ON DUPLICATE KEY UPDATE
         model_config_id = IF(generation_count < ?, VALUES(model_config_id), model_config_id),
         model_name = IF(generation_count < ?, VALUES(model_name), model_name),
         content = IF(generation_count < ?, VALUES(content), content),
         updated_at = IF(generation_count < ?, VALUES(updated_at), updated_at),
         generation_count = IF(generation_count < ?, generation_count + 1, generation_count)`
      : `INSERT INTO user_statement_ai_analyses (id, user_id, statement_id, model_config_id, model_name, content, generation_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?) ON CONFLICT(user_id, statement_id) DO UPDATE SET
         model_config_id = excluded.model_config_id, model_name = excluded.model_name, content = excluded.content,
         generation_count = user_statement_ai_analyses.generation_count + 1, updated_at = excluded.updated_at
         WHERE user_statement_ai_analyses.generation_count < ?`;
    const args: DatabaseArgument[] = [createId(), userId, statementId, model.id, model.name, JSON.stringify(item), now, now];
    const limitCount = getCurrentDialect() === "mysql" ? 5 : 1;
    const affectedRows = await this.executeAffected(sql, [...args, ...Array(limitCount).fill(AI_CONSTANTS.MAX_STATEMENT_REGENERATIONS)]);
    if (affectedRows === 0) throw new BadRequestException(ERROR_MESSAGES.AI_REGENERATION_LIMIT_REACHED);
    const [saved] = await this.query<{ generation_count: number }>(
      "SELECT generation_count FROM user_statement_ai_analyses WHERE user_id = ? AND statement_id = ? LIMIT 1",
      [userId, statementId],
    );
    return this.buildAnalysisResponse(model.name, item, "generated", Number(saved.generation_count));
  }

  private async requestAnalysis(model: ModelRow, statements: StatementRow[]): Promise<AiStatementAnalysis[]> {
    const response = await fetch(`${model.base_url}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${model.api_key}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(AI_CONSTANTS.REQUEST_TIMEOUT_MS),
      body: JSON.stringify({
        model: model.model,
        stream: false,
        temperature: 0.3,
        messages: [
          { role: "system", content: "你是英语教师。只输出 JSON：{\"items\":[{\"statementId\":\"\",\"english\":\"\",\"chinese\":\"\",\"wordMnemonics\":[{\"word\":\"\",\"mnemonic\":\"\"}],\"sentenceAnalysis\":\"\"}]}。为每句挑选值得学习的单词并用中文给出简洁助记，句子分析用中文说明语法结构、关键搭配和表达逻辑。必须保留输入的 statementId。" },
          { role: "user", content: JSON.stringify(statements) },
        ],
      }),
    }).catch(() => { throw new BadGatewayException(ERROR_MESSAGES.AI_MODEL_REQUEST_FAILED); });
    if (!response.ok) throw new BadGatewayException(`${ERROR_MESSAGES.AI_MODEL_REQUEST_FAILED} (${response.status})`);
    
    const rawText = await response.text();
    const rawContent = this.extractContentFromResponse(rawText);
    try {
      const cleaned = this.cleanModelJson(rawContent);
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed.items) || parsed.items.length !== statements.length) throw new Error();
      return parsed.items as AiStatementAnalysis[];
    } catch {
      throw new BadGatewayException(ERROR_MESSAGES.AI_MODEL_RESPONSE_INVALID);
    }
  }

  private extractContentFromResponse(rawText: string): string {
    const trimmed = rawText.trim();
    if (trimmed.startsWith("data:") || trimmed.includes("\ndata:")) {
      let combined = "";
      const lines = trimmed.split(/\r?\n/);
      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith("data:")) continue;
        const dataStr = cleanLine.slice(5).trim();
        if (!dataStr || dataStr === "[DONE]") continue;
        try {
          const chunk = JSON.parse(dataStr);
          const delta = chunk?.choices?.[0]?.delta?.content ?? chunk?.choices?.[0]?.message?.content ?? "";
          combined += delta;
        } catch {
          // 忽略单行非 JSON 块
        }
      }
      if (combined) return combined;
    }

    try {
      const payload = JSON.parse(trimmed);
      return payload?.choices?.[0]?.message?.content || "";
    } catch {
      return trimmed;
    }
  }

  private cleanModelJson(raw: string): string {
    let content = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const firstBrace = content.indexOf("{");
    const lastBrace = content.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      content = content.slice(firstBrace, lastBrace + 1);
    }
    return content;
  }

  private async deactivateAll() { await this.execute("UPDATE ai_model_configs SET is_active = 0 WHERE is_active = 1", []); }
  private normalizeBaseUrl(url: string) { return url.trim().replace(/\/+$/, ""); }
  private nowValue() { return getCurrentDialect() === "mysql" ? new Date() : Date.now(); }
  private async findModel(id: string) {
    const [model] = await this.query<ModelRow>("SELECT * FROM ai_model_configs WHERE id = ? LIMIT 1", [id]);
    if (!model) throw new NotFoundException(ERROR_MESSAGES.AI_MODEL_NOT_FOUND);
    return model;
  }
  private async findPublicModel(id: string) { return this.toPublicModel(await this.findModel(id)); }
  private toPublicModel(row: ModelRow) {
    const key = row.api_key || "";
    const prefix = key.slice(0, AI_CONSTANTS.API_KEY_MASK_PREFIX_LENGTH);
    const suffix = key.slice(-AI_CONSTANTS.API_KEY_MASK_SUFFIX_LENGTH);
    return { id: row.id, name: row.name, baseUrl: row.base_url, model: row.model, apiKeyMasked: `${prefix}${AI_CONSTANTS.API_KEY_MASK}${suffix}`, isActive: Boolean(row.is_active), createdAt: row.created_at, updatedAt: row.updated_at };
  }
  private async query<T>(sql: string, args: DatabaseArgument[]): Promise<T[]> {
    const { client } = getUnderlyingClient();
    if (getCurrentDialect() === "mysql") {
      const [rows] = await (client as Pool).execute(sql, args);
      return rows as T[];
    }
    const result = await (client as Client).execute({ sql, args: args as any[] });
    return result.rows.map((row) => ({ ...row })) as T[];
  }
  private async execute(sql: string, args: DatabaseArgument[]): Promise<void> {
    const { client } = getUnderlyingClient();
    if (getCurrentDialect() === "mysql") { await (client as Pool).execute(sql, args); return; }
    await (client as Client).execute({ sql, args: args as any[] });
  }

  /** 执行写入并返回受影响行数，用于原子额度更新结果判断。 */
  private async executeAffected(sql: string, args: DatabaseArgument[]): Promise<number> {
    const { client } = getUnderlyingClient();
    if (getCurrentDialect() === "mysql") {
      const [result] = await (client as Pool).execute(sql, args);
      return Number((result as { affectedRows?: number }).affectedRows || 0);
    }
    const result = await (client as Client).execute({ sql, args: args as any[] });
    return result.rowsAffected;
  }
}
