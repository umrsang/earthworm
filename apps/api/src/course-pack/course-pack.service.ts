import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  createId,
  DB_DIALECTS,
  getUnderlyingClient,
  type Client,
  type InStatement,
  type Pool,
  type PoolConnection,
  type RowDataPacket,
} from "@jufun/db";
import { ERROR_MESSAGES } from "../common/constants";
import {
  CreateCoursePackDto,
  type PosTagTuple,
  SaveCourseProgressDto,
  type SyntaxTagTuple,
} from "./dto/course-pack.dto";

const MAX_STATEMENT_COUNT_PER_PACK = 10000;
const POS_TAG_TUPLE_LENGTH = 3;
const SYNTAX_TAG_TUPLE_LENGTH = 4;
const WORD_SEPARATOR_PATTERN = /\s+/;

export interface CoursePackRow {
  id: string;
  name: string | null;
  title: string;
  description: string | null;
  version: string | null;
  level: string | null;
  tags: string[];
  totalUnits: number;
  totalVocab: number | null;
  creatorId: string;
  createdAt: string | number;
  courseCount?: number;
  statementCount?: number;
}

export interface CourseRow {
  id: string;
  coursePackId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  statementCount?: number;
  completionCount?: number;
}

export interface StatementRow {
  id: string;
  chinese: string;
  english: string;
  soundmark: string | null;
  posTags: PosTagTuple[];
  syntaxTags: SyntaxTagTuple[];
  sortOrder: number;
}

export interface CreateCoursePackResult {
  coursePackId: string;
  courseIds: string[];
}

export interface CoursePackDetailRow extends CoursePackRow {
  courses: CourseRow[];
  progress: {
    courseId: string;
    statementIndex: number;
  } | null;
}

export interface CourseDetailRow extends CourseRow {
  statements: StatementRow[];
  statementIndex: number;
}

export interface SaveCourseProgressResult {
  courseId: string;
  statementIndex: number;
}

export interface CompleteCourseResult {
  nextCourse: CourseRow | null;
}

/** 将可选文本清理为数据库可用的空值。 */
function normalizeOptionalText(value?: string): string | null {
  return value?.trim() || null;
}

/** 将可选数组序列化为 JSON 文本，空数组按无数据处理。 */
function serializeOptionalJson(value?: unknown[]): string | null {
  return value?.length ? JSON.stringify(value) : null;
}

/** 清理待入库标签，确保前端之外的调用方也得到一致数据。 */
function normalizeStringArray(value?: string[]): string[] {
  return [...new Set((value || []).map((item) => item.trim()).filter(Boolean))];
}

/** 安全解析数据库中的 JSON 数组，兼容空值和历史异常数据。 */
function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 清理标签文本并去重，兼容历史数据库中的空白和重复值。 */
function parseStringArray(value: unknown): string[] {
  const tags = parseJsonArray(value)
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim());
  return [...new Set(tags)];
}

/** 过滤历史数据库中的畸形、越界标注，避免异常 JSON tuple 进入接口响应。 */
function parseTagTupleArray<T extends PosTagTuple | SyntaxTagTuple>(
  value: unknown,
  tupleLength: number,
  wordCount: number,
): T[] {
  return parseJsonArray(value)
    .filter((item): item is unknown[] =>
      Array.isArray(item)
      && item.length === tupleLength
      && typeof item[0] === "number"
      && typeof item[1] === "number"
      && Number.isInteger(item[0])
      && Number.isInteger(item[1])
      && item[0] >= 0
      && item[1] >= item[0]
      && item[1] < wordCount
      && item.slice(2).every((label) => typeof label === "string" && Boolean(label.trim())),
    )
    .map((item) => item.map((part) => typeof part === "string" ? part.trim() : part) as unknown as T);
}

/** 将数据库中的可空数值转换为有限数字，异常历史值按空值处理。 */
function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 不同驱动返回字段命名不同，统一转换为前端接口使用的 camelCase。 */
function normalizeRow<T>(row: Record<string, unknown>): T {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase())] = value;
  }
  return normalized as T;
}

@Injectable()
export class CoursePackService {
  /**
   * 创建课程包及其全部课程、句子。
   * @param userId 当前登录用户 ID
   * @param dto 已由全局 ValidationPipe 校验的课程包数据
   * @returns 新课程包 ID、课程 ID 列表
   */
  async create(userId: string, dto: CreateCoursePackDto): Promise<CreateCoursePackResult> {
    const totalStatementCount = dto.courses.reduce((total, course) => total + course.statements.length, 0);
    if (totalStatementCount > MAX_STATEMENT_COUNT_PER_PACK) {
      throw new BadRequestException(ERROR_MESSAGES.COURSE_PACK_TOO_LARGE);
    }
    if (dto.totalUnits !== undefined && dto.totalUnits !== dto.courses.length) {
      throw new BadRequestException(ERROR_MESSAGES.COURSE_PACK_METADATA_INVALID);
    }
    this.validateStatementAnnotationIndexes(dto);

    const coursePackId = createId();
    const courseIds = dto.courses.map(() => createId());
    const { dialect, client } = getUnderlyingClient();

    if (dialect === DB_DIALECTS.MYSQL) {
      const connection = await (client as Pool).getConnection();
      try {
        await connection.beginTransaction();
        await this.insertMysqlCoursePack(connection, userId, coursePackId, courseIds, dto);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      const now = Date.now();
      const statements: InStatement[] = [
        {
          sql: `INSERT INTO course_packs
                (id, name, title, description, version, level, tags, total_units, total_vocab, creator_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            coursePackId,
            normalizeOptionalText(dto.name),
            dto.title.trim(),
            normalizeOptionalText(dto.description),
            normalizeOptionalText(dto.version),
            normalizeOptionalText(dto.level),
            serializeOptionalJson(normalizeStringArray(dto.tags)),
            dto.courses.length,
            dto.totalVocab ?? null,
            userId,
            now,
            now,
          ],
        },
      ];

      dto.courses.forEach((course, courseIndex) => {
        const courseId = courseIds[courseIndex];
        statements.push({
          sql: `INSERT INTO courses (id, course_pack_id, title, description, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?);`,
          args: [courseId, coursePackId, course.title.trim(), course.description?.trim() || null, courseIndex + 1, now, now],
        });
        course.statements.forEach((statement, statementIndex) => {
          statements.push({
            sql: `INSERT INTO statements
                  (id, course_id, chinese, english, soundmark, pos_tags, syntax_tags, sort_order, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            args: [
              createId(),
              courseId,
              statement.chinese.trim(),
              statement.english.trim(),
              normalizeOptionalText(statement.soundmark),
              serializeOptionalJson(statement.posTags),
              serializeOptionalJson(statement.syntaxTags),
              statementIndex + 1,
              now,
              now,
            ],
          });
        });
      });
      await (client as Client).batch(statements, "write");
    }

    return { coursePackId, courseIds };
  }

  /** 获取当前用户拥有的课程包列表。 */
  async findAll(userId: string): Promise<CoursePackRow[]> {
    const rows = await this.query<Omit<CoursePackRow, "tags"> & { tags: unknown }>(
      `SELECT cp.id, cp.name, cp.title, cp.description, cp.version, cp.level, cp.tags,
              cp.total_units, cp.total_vocab, cp.creator_id, cp.created_at,
              COUNT(DISTINCT c.id) AS course_count,
              COUNT(DISTINCT s.id) AS statement_count
       FROM course_packs cp
       LEFT JOIN courses c ON c.course_pack_id = cp.id
       LEFT JOIN statements s ON s.course_id = c.id
       WHERE cp.creator_id = ?
       GROUP BY cp.id, cp.name, cp.title, cp.description, cp.version, cp.level, cp.tags,
                cp.total_units, cp.total_vocab, cp.creator_id, cp.created_at
       ORDER BY cp.created_at DESC`,
      [userId],
    );
    return rows.map((row) => ({
      ...row,
      tags: parseStringArray(row.tags),
      totalUnits: Number(row.courseCount || 0),
      totalVocab: parseNullableNumber(row.totalVocab),
      courseCount: Number(row.courseCount || 0),
      statementCount: Number(row.statementCount || 0),
    }));
  }

  /** 获取课程包目录及每课完成次数。 */
  async findOne(userId: string, coursePackId: string): Promise<CoursePackDetailRow> {
    const coursePack = await this.requireOwnedPack(userId, coursePackId);
    const courses = await this.query<CourseRow>(
      `SELECT c.id, c.course_pack_id, c.title, c.description, c.sort_order,
              COUNT(DISTINCT s.id) AS statement_count,
              COALESCE(MAX(ch.completion_count), 0) AS completion_count
       FROM courses c
       LEFT JOIN statements s ON s.course_id = c.id
       LEFT JOIN course_history ch ON ch.course_id = c.id AND ch.user_id = ?
       WHERE c.course_pack_id = ?
       GROUP BY c.id, c.course_pack_id, c.title, c.description, c.sort_order
       ORDER BY c.sort_order ASC`,
      [userId, coursePackId],
    );
    const progressRows = await this.query<{ courseId: string; statementIndex: number }>(
      "SELECT course_id, statement_index FROM user_course_progress WHERE user_id = ? AND course_pack_id = ? LIMIT 1",
      [userId, coursePackId],
    );
    return {
      ...coursePack,
      totalUnits: courses.length,
      courses: courses.map((course) => ({
        ...course,
        statementCount: Number(course.statementCount || 0),
        completionCount: Number(course.completionCount || 0),
      })),
      progress: progressRows[0]
        ? {
            courseId: progressRows[0].courseId,
            statementIndex: Number(progressRows[0].statementIndex),
          }
        : null,
    };
  }

  /** 获取一课的全部句子与用户上次保存位置。 */
  async findCourse(userId: string, coursePackId: string, courseId: string): Promise<CourseDetailRow> {
    const course = await this.requireOwnedCourse(userId, coursePackId, courseId);
    const statementRows = await this.query<Omit<StatementRow, "posTags" | "syntaxTags"> & {
      posTags: unknown;
      syntaxTags: unknown;
    }>(
      `SELECT id, chinese, english, soundmark, pos_tags, syntax_tags, sort_order
       FROM statements WHERE course_id = ? ORDER BY sort_order ASC`,
      [courseId],
    );
    const statements: StatementRow[] = statementRows.map((statement) => {
      const wordCount = statement.english.trim().split(WORD_SEPARATOR_PATTERN).filter(Boolean).length;
      return {
        ...statement,
        posTags: parseTagTupleArray<PosTagTuple>(statement.posTags, POS_TAG_TUPLE_LENGTH, wordCount),
        syntaxTags: parseTagTupleArray<SyntaxTagTuple>(statement.syntaxTags, SYNTAX_TAG_TUPLE_LENGTH, wordCount),
      };
    });
    const progressRows = await this.query<{ courseId: string; statementIndex: number }>(
      "SELECT course_id, statement_index FROM user_course_progress WHERE user_id = ? AND course_pack_id = ? LIMIT 1",
      [userId, coursePackId],
    );
    const savedProgress = progressRows[0];
    return {
      ...course,
      statements,
      statementIndex: savedProgress?.courseId === courseId ? Number(savedProgress.statementIndex) : 0,
    };
  }

  /**
   * 保存学习位置；同一用户在每个课程包中只保留一条最新进度。
   * @param userId 当前登录用户 ID
   * @param coursePackId 课程包 ID
   * @param dto 当前课程 ID 与句子索引
   */
  async saveProgress(
    userId: string,
    coursePackId: string,
    dto: SaveCourseProgressDto,
  ): Promise<SaveCourseProgressResult> {
    const course = await this.requireOwnedCourse(userId, coursePackId, dto.courseId);
    const countRows = await this.query<{ total: number }>(
      "SELECT COUNT(*) AS total FROM statements WHERE course_id = ?",
      [dto.courseId],
    );
    const statementCount = Number(countRows[0]?.total || 0);
    if (statementCount === 0 || dto.statementIndex >= statementCount) {
      throw new BadRequestException(ERROR_MESSAGES.COURSE_PROGRESS_OUT_OF_RANGE);
    }

    const { dialect, client } = getUnderlyingClient();
    const progressId = createId();
    if (dialect === DB_DIALECTS.MYSQL) {
      await (client as Pool).execute(
        `INSERT INTO user_course_progress (id, user_id, course_pack_id, course_id, statement_index)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE course_id = VALUES(course_id), statement_index = VALUES(statement_index), updated_at = CURRENT_TIMESTAMP`,
        [progressId, userId, coursePackId, dto.courseId, dto.statementIndex],
      );
    } else {
      const now = Date.now();
      await (client as Client).execute({
        sql: `INSERT INTO user_course_progress (id, user_id, course_pack_id, course_id, statement_index, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, course_pack_id) DO UPDATE SET
                course_id = excluded.course_id,
                statement_index = excluded.statement_index,
                updated_at = excluded.updated_at`,
        args: [progressId, userId, coursePackId, dto.courseId, dto.statementIndex, now],
      });
    }
    return { courseId: course.id, statementIndex: dto.statementIndex };
  }

  /** 完成课程，并在同一事务中将学习进度移动到下一课。 */
  async completeCourse(
    userId: string,
    coursePackId: string,
    courseId: string,
  ): Promise<CompleteCourseResult> {
    const course = await this.requireOwnedCourse(userId, coursePackId, courseId);
    const nextCourses = await this.query<CourseRow>(
      `SELECT id, course_pack_id, title, description, sort_order
       FROM courses WHERE course_pack_id = ? AND sort_order > ? ORDER BY sort_order ASC LIMIT 1`,
      [coursePackId, course.sortOrder],
    );
    const nextCourse = nextCourses[0] || null;
    const progressCourseId = nextCourse?.id || courseId;
    const historyId = createId();
    const progressId = createId();
    const { dialect, client } = getUnderlyingClient();

    if (dialect === DB_DIALECTS.MYSQL) {
      const connection = await (client as Pool).getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          `INSERT INTO course_history (id, user_id, course_pack_id, course_id, completion_count)
           VALUES (?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE completion_count = completion_count + 1, updated_at = CURRENT_TIMESTAMP`,
          [historyId, userId, coursePackId, courseId],
        );
        await connection.execute(
          `INSERT INTO user_course_progress (id, user_id, course_pack_id, course_id, statement_index)
           VALUES (?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE course_id = VALUES(course_id), statement_index = 0, updated_at = CURRENT_TIMESTAMP`,
          [progressId, userId, coursePackId, progressCourseId],
        );
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } else {
      const now = Date.now();
      await (client as Client).batch(
        [
          {
            sql: `INSERT INTO course_history (id, user_id, course_pack_id, course_id, completion_count, updated_at)
                  VALUES (?, ?, ?, ?, 1, ?)
                  ON CONFLICT(user_id, course_id) DO UPDATE SET
                    completion_count = completion_count + 1,
                    updated_at = excluded.updated_at`,
            args: [historyId, userId, coursePackId, courseId, now],
          },
          {
            sql: `INSERT INTO user_course_progress (id, user_id, course_pack_id, course_id, statement_index, updated_at)
                  VALUES (?, ?, ?, ?, 0, ?)
                  ON CONFLICT(user_id, course_pack_id) DO UPDATE SET
                    course_id = excluded.course_id,
                    statement_index = 0,
                    updated_at = excluded.updated_at`,
            args: [progressId, userId, coursePackId, progressCourseId, now],
          },
        ],
        "write",
      );
    }
    return { nextCourse };
  }

  private async insertMysqlCoursePack(
    connection: PoolConnection,
    userId: string,
    coursePackId: string,
    courseIds: string[],
    dto: CreateCoursePackDto,
  ) {
    await connection.execute(
      `INSERT INTO course_packs
       (id, name, title, description, version, level, tags, total_units, total_vocab, creator_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        coursePackId,
        normalizeOptionalText(dto.name),
        dto.title.trim(),
        normalizeOptionalText(dto.description),
        normalizeOptionalText(dto.version),
        normalizeOptionalText(dto.level),
        serializeOptionalJson(normalizeStringArray(dto.tags)),
        dto.courses.length,
        dto.totalVocab ?? null,
        userId,
      ],
    );
    for (const [courseIndex, course] of dto.courses.entries()) {
      const courseId = courseIds[courseIndex];
      await connection.execute(
        `INSERT INTO courses (id, course_pack_id, title, description, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [courseId, coursePackId, course.title.trim(), course.description?.trim() || null, courseIndex + 1],
      );
      if (course.statements.length > 0) {
        const values = course.statements.map((statement, statementIndex) => [
          createId(),
          courseId,
          statement.chinese.trim(),
          statement.english.trim(),
          normalizeOptionalText(statement.soundmark),
          serializeOptionalJson(statement.posTags),
          serializeOptionalJson(statement.syntaxTags),
          statementIndex + 1,
        ]);
        const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
        await connection.execute(
          `INSERT INTO statements
           (id, course_id, chinese, english, soundmark, pos_tags, syntax_tags, sort_order)
           VALUES ${placeholders}`,
          values.flat(),
        );
      }
    }
  }

  /** 在入库前结合英文分词数量验证标注索引，避免无效范围进入数据库。 */
  private validateStatementAnnotationIndexes(dto: CreateCoursePackDto): void {
    for (const course of dto.courses) {
      for (const statement of course.statements) {
        const wordCount = statement.english.trim().split(WORD_SEPARATOR_PATTERN).filter(Boolean).length;
        const tags = [...(statement.posTags || []), ...(statement.syntaxTags || [])];
        if (tags.some((tag) => tag[1] >= wordCount)) {
          throw new BadRequestException(ERROR_MESSAGES.COURSE_ANNOTATION_INVALID);
        }
      }
    }
  }

  private async requireOwnedPack(userId: string, coursePackId: string): Promise<CoursePackRow> {
    const rows = await this.query<Omit<CoursePackRow, "tags"> & { tags: unknown }>(
      `SELECT id, name, title, description, version, level, tags, total_units, total_vocab,
              creator_id, created_at
       FROM course_packs WHERE id = ? AND creator_id = ? LIMIT 1`,
      [coursePackId, userId],
    );
    if (!rows[0]) throw new NotFoundException(ERROR_MESSAGES.COURSE_PACK_NOT_FOUND);
    return {
      ...rows[0],
      tags: parseStringArray(rows[0].tags),
      totalUnits: Number(rows[0].totalUnits || 0),
      totalVocab: parseNullableNumber(rows[0].totalVocab),
    };
  }

  private async requireOwnedCourse(userId: string, coursePackId: string, courseId: string): Promise<CourseRow> {
    const rows = await this.query<CourseRow>(
      `SELECT c.id, c.course_pack_id, c.title, c.description, c.sort_order
       FROM courses c
       INNER JOIN course_packs cp ON cp.id = c.course_pack_id
       WHERE c.id = ? AND c.course_pack_id = ? AND cp.creator_id = ? LIMIT 1`,
      [courseId, coursePackId, userId],
    );
    if (!rows[0]) throw new NotFoundException(ERROR_MESSAGES.COURSE_NOT_FOUND);
    return rows[0];
  }

  /** 执行跨方言查询并统一字段名。 */
  private async query<T>(sql: string, args: Array<string | number>): Promise<T[]> {
    const { dialect, client } = getUnderlyingClient();
    if (dialect === DB_DIALECTS.MYSQL) {
      const [rows] = await (client as Pool).execute<RowDataPacket[]>(sql, args);
      return rows.map((row) => normalizeRow<T>(row));
    }
    const result = await (client as Client).execute({ sql, args });
    return result.rows.map((row) => normalizeRow<T>(row as Record<string, unknown>));
  }
}
