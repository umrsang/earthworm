import "reflect-metadata";

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UploadCoursePackDto } from "../course-pack/dto/upload-course-pack.dto";
import { RecordAttemptDto, UpdateDailyPlanDto } from "./learning-experience.dto";

describe("prototype backend DTO validation", () => {
  it("rejects an upload without courses", async () => {
    const dto = plainToInstance(UploadCoursePackDto, {
      title: "Empty",
      courses: [],
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "courses")).toBe(true);
  });

  it("accepts a complete learning attempt", async () => {
    const dto = plainToInstance(RecordAttemptDto, {
      coursePackId: "pack",
      courseId: "course",
      statementId: "statement",
      answer: "I'd like to check in.",
      isCorrect: true,
      hintUsed: false,
      durationMs: 1200,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it("rejects an invalid daily goal", async () => {
    const dto = plainToInstance(UpdateDailyPlanDto, {
      date: "2026-07-29",
      goalStatements: 0,
      items: [],
    });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === "goalStatements")).toBe(true);
  });
});
