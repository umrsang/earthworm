import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";

import { createTestUser } from "../../../test/fixture/user";
import { cleanDB, signin } from "../../../test/helper/utils";
import { AppModule } from "../../app/app.module";
import { appGlobalMiddleware } from "../../app/useGlobal";
import { endDB } from "../../common/db";
import { DB, DbType } from "../../global/providers/db.provider";

describe("rank e2e", () => {
  let app: INestApplication;
  let db: DbType;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appGlobalMiddleware(app);
    db = moduleFixture.get<DbType>(DB);

    await app.init();
    await cleanDB(db);
    await setupDBData(moduleFixture);
    token = await signin(moduleFixture);
  });

  afterEach(async () => {
    await cleanDB(db);
    await endDB();
    await app.close();
  });

  it("get: /rank/progress/weekly", async () => {
    await request(app.getHttpServer())
      .get("/rank/progress/weekly")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            list: expect.arrayContaining([
              expect.objectContaining({
                username: expect.anything(),
                count: 1,
              }),
            ]),
          }),
        );
      });
  });

  it("get: /rank/progress/weekly has self", async () => {
    await request(app.getHttpServer())
      .get("/rank/progress/weekly")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.self).toHaveProperty("userId");
        expect(body.self).toHaveProperty("rank");
        expect(body.self).toHaveProperty("count");
        expect(body.self).toHaveProperty("username");
      });
  });
});

async function setupDBData(builder: TestingModule) {
  const { userId } = await createTestUser(builder, "xiaoming");
  const db = builder.get<DbType>(DB);
  const { userRank } = await import("@earthworm/schema");
  const { RankPeriod } = await import("../rank.service");

  // Insert rank data for all periods
  for (const period of Object.values(RankPeriod)) {
    await db.insert(userRank).values({
      userId,
      period,
      count: 1,
    });
  }
}
