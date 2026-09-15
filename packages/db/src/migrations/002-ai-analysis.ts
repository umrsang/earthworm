/**
 * 迁移 002：AI 模型配置与早期课程级分析缓存。
 * 创建模型配置表、将默认 admin 账号升级为管理员，并保留最初的课程级缓存表以兼容已执行该版本的数据库。
 */
import type { DbMigration } from "./types.ts";

export const aiAnalysisMigration: DbMigration = {
  version: "002-ai-analysis",
  sqlite: [
    "UPDATE users SET role = 'admin' WHERE username = 'admin'",
    `CREATE TABLE IF NOT EXISTS ai_model_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      model TEXT NOT NULL,
      api_key TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    "CREATE INDEX IF NOT EXISTS ai_model_active_idx ON ai_model_configs(is_active)",
    `CREATE TABLE IF NOT EXISTS course_ai_analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      model_config_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (user_id, course_id, model_config_id),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    )`,
  ],
  mysql: [
    "UPDATE users SET role = 'admin' WHERE username = 'admin'",
    `CREATE TABLE IF NOT EXISTS ai_model_configs (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      base_url VARCHAR(512) NOT NULL,
      model VARCHAR(128) NOT NULL,
      api_key TEXT NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX ai_model_active_idx (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    `CREATE TABLE IF NOT EXISTS course_ai_analyses (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      user_id VARCHAR(128) NOT NULL,
      course_id VARCHAR(128) NOT NULL,
      model_config_id VARCHAR(128) NOT NULL,
      content LONGTEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY course_ai_analysis_cache_unique (user_id, course_id, model_config_id),
      CONSTRAINT course_ai_analysis_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT course_ai_analysis_model_fk FOREIGN KEY (model_config_id) REFERENCES ai_model_configs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ],
};
