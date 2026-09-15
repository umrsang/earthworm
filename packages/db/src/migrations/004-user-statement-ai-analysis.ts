import type { DbMigration } from "./types.ts";

export const userStatementAiAnalysisMigration: DbMigration = {
  version: "004-user-statement-ai-analysis",
  sqlite: [
    `CREATE TABLE IF NOT EXISTS system_statement_ai_analyses (
      id TEXT PRIMARY KEY,
      statement_id TEXT NOT NULL,
      model_config_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (statement_id, model_config_id),
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    )`,
    `INSERT OR IGNORE INTO system_statement_ai_analyses (id, statement_id, model_config_id, content, created_at, updated_at)
     SELECT id, statement_id, model_config_id, content, created_at, updated_at
     FROM statement_ai_analyses
     ORDER BY updated_at DESC`,
    `CREATE TABLE IF NOT EXISTS user_statement_ai_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      statement_id TEXT NOT NULL,
      model_config_id TEXT,
      model_name TEXT NOT NULL,
      content TEXT NOT NULL,
      generation_count INTEGER NOT NULL DEFAULT 0 CHECK (generation_count >= 0 AND generation_count <= 3),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (user_id, statement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE SET NULL
    )`,
  ],
  mysql: [
    `CREATE TABLE IF NOT EXISTS system_statement_ai_analyses (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      statement_id VARCHAR(128) NOT NULL,
      model_config_id VARCHAR(128) NOT NULL,
      content LONGTEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY system_statement_ai_analysis_unique (statement_id, model_config_id),
      CONSTRAINT system_statement_ai_analysis_statement_fk FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      CONSTRAINT system_statement_ai_analysis_model_fk FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `INSERT IGNORE INTO system_statement_ai_analyses (id, statement_id, model_config_id, content, created_at, updated_at)
     SELECT id, statement_id, model_config_id, content, created_at, updated_at FROM statement_ai_analyses ORDER BY updated_at DESC`,
    `CREATE TABLE IF NOT EXISTS user_statement_ai_analyses (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      statement_id VARCHAR(128) NOT NULL,
      model_config_id VARCHAR(128),
      model_name VARCHAR(128) NOT NULL,
      content LONGTEXT NOT NULL,
      generation_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY user_statement_ai_analysis_unique (user_id, statement_id),
      CONSTRAINT user_statement_ai_analysis_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT user_statement_ai_analysis_statement_fk FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
      CONSTRAINT user_statement_ai_analysis_model_fk FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ],
};
