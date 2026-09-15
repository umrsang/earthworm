/**
 * 迁移 003：句子级 AI 分析缓存。
 * 创建当前业务实际使用的句子分析表，按用户、句子和模型配置唯一保存单词助记及句子分析结果。
 */
import type { DbMigration } from "./types.ts";

export const statementAiAnalysisMigration: DbMigration = {
  version: "003-statement-ai-analysis",
  sqlite: [
    `CREATE TABLE IF NOT EXISTS statement_ai_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      statement_id TEXT NOT NULL,
      model_config_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (user_id, statement_id, model_config_id),
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    )`,
  ],
  mysql: [
    `CREATE TABLE IF NOT EXISTS statement_ai_analyses (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      statement_id VARCHAR(128) NOT NULL,
      model_config_id VARCHAR(128) NOT NULL,
      content LONGTEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY statement_ai_analysis_cache_unique (user_id, statement_id, model_config_id),
      CONSTRAINT statement_ai_analysis_statement_fk FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      CONSTRAINT statement_ai_analysis_model_fk FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ],
};
