import fs from "node:fs";
import path from "node:path";

import { eq, sql } from "drizzle-orm";

import { db } from "@earthworm/db";
import {
  coursePack,
  course as courseSchema,
  statement as statementSchema,
} from "@earthworm/schema";

type Statement = typeof statementSchema.$inferInsert;

const courses = fs.readdirSync(path.resolve(__dirname, "../data/courses"));

(async function () {
  // MySQL: disable foreign key checks before deleting
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`TRUNCATE TABLE statements`);
  await db.execute(sql`TRUNCATE TABLE courses`);
  await db.execute(sql`TRUNCATE TABLE course_packs`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  await db.insert(coursePack).values({
    order: 1,
    title: "星荣零基础学英语",
    description: "最适合零基础入门的课程",
    creatorId: "1",
    shareLevel: "public",
    isFree: true,
    cover:
      "https://earthworm-prod-1312884695.cos.ap-beijing.myqcloud.com/course-packs/xingrong.jpg",
  });

  const [coursePackEntity] = await db
    .select()
    .from(coursePack)
    .where(eq(coursePack.title, "星荣零基础学英语"))
    .limit(1);

  const courseList = await Promise.all(
    courses.map(async (courseFileName, index) => {
      const courseName = path.parse(courseFileName).name;

      await db.insert(courseSchema).values({
        coursePackId: coursePackEntity.id,
        order: index + 1,
        title: convertToChineseNumber(courseName),
      });

      const [course] = await db
        .select({ id: courseSchema.id, order: courseSchema.order, title: courseSchema.title })
        .from(courseSchema)
        .where(eq(courseSchema.coursePackId, coursePackEntity.id))
        .where(eq(courseSchema.order, index + 1))
        .limit(1);

      console.log(`创建: id-${course.id} order-${course.order} title-${course.title}`);

      return {
        ...course,
        meta: {
          courseFileName,
          courseName,
        },
      };
    }),
  );

  await Promise.all(
    courseList.map(async (course) => {
      const { id: courseId, meta } = course;

      const courseDataJsonText = fs.readFileSync(
        path.resolve(__dirname, `../data/courses/${meta.courseFileName}`),
        "utf-8",
      );

      const statementList = JSON.parse(courseDataJsonText) as Statement[];

      let order = 1;
      const statementInsertTask = statementList.map(async (statement) => {
        return await db.insert(statementSchema).values({
          ...statement,
          order: order++,
          courseId,
        });
      });

      console.log(`courseName: ${meta.courseFileName} 开始上传`);
      await Promise.all(statementInsertTask);
      console.log(`courseName: ${meta.courseFileName} 全部上传成功`);
    }),
  );

  console.log("全部创建完成");
  process.exit(0);
})();

function convertToChineseNumber(numStr: string): string {
  const chineseNumbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  let chineseStr = "第";
  if (parseInt(numStr) >= 10) {
    const [tens, ones] = numStr.split("");
    if (tens !== "1") {
      chineseStr += chineseNumbers[parseInt(tens, 10)];
    }
    chineseStr += "十";
    if (ones !== "0") {
      chineseStr += chineseNumbers[parseInt(ones, 10)];
    }
  } else {
    chineseStr += chineseNumbers[parseInt(numStr, 10)];
  }
  chineseStr += "课";
  return chineseStr;
}
