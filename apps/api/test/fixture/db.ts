import { eq } from "drizzle-orm";
import { DbType } from "src/global/providers/db.provider";

import { course, coursePack, statement, userCourseProgress } from "@earthworm/schema";
import { getTokenOwner } from "../../test/fixture/user";

type CoursePackInsert = typeof coursePack.$inferInsert;

export async function insertCoursePack(db: DbType, values?: Partial<CoursePackInsert>) {
  const defaultCoursePack = {
    order: 1,
    title: "课程包",
    description: "这是一个课程包",
    isFree: true,
    creatorId: "test",
    shareLevel: "public",
  } satisfies CoursePackInsert;

  const insertValues = {
    ...defaultCoursePack,
    ...values,
  };

  await db.insert(coursePack).values(insertValues);

  // MySQL doesn't support RETURNING, query by the generated id
  const [entity] = await db
    .select()
    .from(coursePack)
    .where(eq(coursePack.title, insertValues.title))
    .orderBy(coursePack.createdAt)
    .limit(1);

  return entity;
}

type CourseInsert = typeof course.$inferInsert;
export async function insertCourse(
  db: DbType,
  coursePackId: string,
  values?: Partial<CourseInsert>,
) {
  const defaultCourse = {
    order: 1,
    title: "第一课",
    coursePackId,
  } satisfies CourseInsert;

  const insertValues = {
    ...defaultCourse,
    ...values,
  };

  await db.insert(course).values(insertValues);

  const [entity] = await db
    .select()
    .from(course)
    .where(eq(course.coursePackId, insertValues.coursePackId))
    .orderBy(course.createdAt)
    .limit(1);

  return entity;
}

type StatementInsert = typeof statement.$inferInsert;
export async function insertStatement(
  db: DbType,
  courseId: string,
  order: number,
  values?: Partial<StatementInsert>,
) {
  const defaultStatement = {
    order,
    courseId,
    chinese: "你好",
    english: "hello",
    soundmark: "nihao",
  } satisfies StatementInsert;

  const insertValues = {
    ...defaultStatement,
    ...values,
  };

  await db.insert(statement).values(insertValues);

  const [entity] = await db
    .select()
    .from(statement)
    .where(eq(statement.courseId, insertValues.courseId))
    .orderBy(statement.createdAt)
    .limit(1);

  return entity;
}

export async function insertUserCourseProgress(
  db: DbType,
  coursePackId: string,
  courseId: string,
  statementIndex: number,
) {
  const userId = getTokenOwner();

  await db.insert(userCourseProgress).values({
    userId,
    coursePackId,
    courseId,
    statementIndex,
  });

  const [entity] = await db
    .select()
    .from(userCourseProgress)
    .where(eq(userCourseProgress.userId, userId))
    .orderBy(userCourseProgress.createdAt)
    .limit(1);

  return entity;
}
