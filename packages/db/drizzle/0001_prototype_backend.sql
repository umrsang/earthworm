ALTER TABLE `course_packs`
  ADD COLUMN `difficulty` varchar(32),
  ADD COLUMN `tags` json,
  ADD COLUMN `status` varchar(32) NOT NULL DEFAULT 'draft';
--> statement-breakpoint
UPDATE `course_packs` SET `status` = 'published' WHERE `share_level` <> 'private';
--> statement-breakpoint
CREATE TABLE `user_course_library` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `course_pack_id` varchar(128) NOT NULL,
  `is_favorite` boolean NOT NULL DEFAULT false,
  `enrolled_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `user_course_library_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_course_library_user_id_course_pack_id_unique` UNIQUE(`user_id`,`course_pack_id`)
);
--> statement-breakpoint
CREATE TABLE `daily_plans` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `date` varchar(10) NOT NULL,
  `goal_statements` int NOT NULL DEFAULT 20,
  `completed_statements` int NOT NULL DEFAULT 0,
  `items` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `daily_plans_id` PRIMARY KEY(`id`),
  CONSTRAINT `daily_plans_user_id_date_unique` UNIQUE(`user_id`,`date`)
);
--> statement-breakpoint
CREATE TABLE `learning_attempts` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `course_pack_id` varchar(128) NOT NULL,
  `course_id` varchar(128) NOT NULL,
  `statement_id` varchar(128) NOT NULL,
  `answer` text NOT NULL,
  `is_correct` boolean NOT NULL,
  `hint_used` boolean NOT NULL DEFAULT false,
  `duration_ms` int NOT NULL DEFAULT 0,
  `attempted_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `learning_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_items` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `course_pack_id` varchar(128) NOT NULL,
  `course_id` varchar(128) NOT NULL,
  `statement_id` varchar(128) NOT NULL,
  `mastery` int NOT NULL DEFAULT 0,
  `interval_days` int NOT NULL DEFAULT 1,
  `wrong_count` int NOT NULL DEFAULT 0,
  `due_at` timestamp NOT NULL DEFAULT (now()),
  `last_reviewed_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `review_items_id` PRIMARY KEY(`id`),
  CONSTRAINT `review_items_user_id_statement_id_unique` UNIQUE(`user_id`,`statement_id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `settings` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
  `id` varchar(128) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `type` varchar(64) NOT NULL,
  `title` varchar(256) NOT NULL,
  `content` text,
  `action_url` varchar(512),
  `is_read` boolean NOT NULL DEFAULT false,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `read_at` timestamp,
  CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
