import type { DbMigration } from "./types";

export const learningActivityEventsMigration: DbMigration = {
  version: "001-learning-activity-events",
  mysql: [
    `CREATE TABLE IF NOT EXISTS learning_activity_events (
      id VARCHAR(128) NOT NULL PRIMARY KEY,
      event_id VARCHAR(128) NOT NULL,
      user_id VARCHAR(128) NOT NULL,
      course_pack_id VARCHAR(128) NOT NULL,
      course_id VARCHAR(128) NOT NULL,
      statement_id VARCHAR(128) NULL,
      event_type VARCHAR(32) NOT NULL,
      duration_seconds INT NOT NULL DEFAULT 0,
      attempt_count INT NOT NULL DEFAULT 0,
      correct_count INT NOT NULL DEFAULT 0,
      learning_date VARCHAR(10) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY learning_event_user_id_unique (user_id, event_id),
      INDEX learning_event_user_date_idx (user_id, learning_date),
      INDEX learning_event_user_created_idx (user_id, created_at),
      INDEX learning_event_course_idx (user_id, course_id),
      CONSTRAINT learning_event_pack_fk FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
      CONSTRAINT learning_event_course_fk FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT learning_event_statement_fk FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ],
  sqlite: [
    `CREATE TABLE IF NOT EXISTS learning_activity_events (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      course_pack_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      statement_id TEXT,
      event_type TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      learning_date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (user_id, event_id),
      FOREIGN KEY (course_pack_id) REFERENCES course_packs(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE
    );`,
    "CREATE INDEX IF NOT EXISTS learning_event_user_date_idx ON learning_activity_events(user_id, learning_date);",
    "CREATE INDEX IF NOT EXISTS learning_event_user_created_idx ON learning_activity_events(user_id, created_at);",
    "CREATE INDEX IF NOT EXISTS learning_event_course_idx ON learning_activity_events(user_id, course_id);",
  ],
};
