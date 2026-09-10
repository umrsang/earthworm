import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import {
  createEmptyRankList,
  createRankListWithFirstUserFinishedCourse,
  createRankListWithUserFinishedCourse2Times,
} from "../../../test/fixture/rank";
import { createUser } from "../../../test/fixture/user";
import { cleanDB, testImportModules } from "../../../test/helper/utils";
import { endDB } from "../../common/db";
import { DB, DbType } from "../../global/providers/db.provider";
import { UserService } from "../../user/user.service";
import { RankPeriod, RankService } from "../rank.service";

const user = createUser();
const emptyRankList = createEmptyRankList();
const firstUserFinished = createRankListWithFirstUserFinishedCourse();
const userFinishedTwice = createRankListWithUserFinishedCourse2Times();

describe("rank service", () => {
  let rankService: RankService;
  let db: DbType;

  beforeAll(async () => {
    const testHelper = await setupTesting();
    db = testHelper.db;
    rankService = testHelper.rankService;
  });

  afterAll(async () => {
    await cleanDB(db);
    await endDB();
  });

  beforeEach(async () => {
    await cleanDB(db);
  });

  describe("RankList", () => {
    it("should return empty rank list", async () => {
      const resWeek = await rankService.getRankList(user);
      const resMonth = await rankService.getRankList(user, RankPeriod.MONTHLY);
      const resYear = await rankService.getRankList(user, RankPeriod.YEARLY);

      expect(resWeek).toEqual(emptyRankList);
      expect(resMonth).toEqual(emptyRankList);
      expect(resYear).toEqual(emptyRankList);
    });

    it("should return rank list with first user finished course", async () => {
      await rankService.userFinishCourse(user.userId);
      const resWeek = await rankService.getRankList(user);
      const resMonth = await rankService.getRankList(user, RankPeriod.MONTHLY);
      const resYear = await rankService.getRankList(user, RankPeriod.YEARLY);

      expect(resWeek).toEqual(firstUserFinished);
      expect(resMonth).toEqual(firstUserFinished);
      expect(resYear).toEqual(firstUserFinished);

      await rankService.resetRankList();
    });

    it("should return rank list with user finished course 2 times", async () => {
      await rankService.userFinishCourse(user.userId);
      await rankService.userFinishCourse(user.userId);
      const resWeek = await rankService.getRankList(user);
      const resMonth = await rankService.getRankList(user, RankPeriod.MONTHLY);
      const resYear = await rankService.getRankList(user, RankPeriod.YEARLY);

      expect(resWeek).toEqual(userFinishedTwice);
      expect(resMonth).toEqual(userFinishedTwice);
      expect(resYear).toEqual(userFinishedTwice);

      await rankService.resetRankList();
    });

    it("should return empty rank list after week reset", async () => {
      await rankService.userFinishCourse(user.userId);
      await rankService.resetRankList();
      const res = await rankService.getRankList(user);
      expect(res).toEqual(emptyRankList);
    });

    it("should return empty rank list after month reset", async () => {
      await rankService.userFinishCourse(user.userId);
      await rankService.resetRankList(RankPeriod.MONTHLY);
      const res = await rankService.getRankList(user, RankPeriod.MONTHLY);
      expect(res).toEqual(emptyRankList);
    });

    it("should return empty rank list after year reset", async () => {
      await rankService.userFinishCourse(user.userId);
      await rankService.resetRankList(RankPeriod.YEARLY);
      const res = await rankService.getRankList(user, RankPeriod.YEARLY);
      expect(res).toEqual(emptyRankList);
    });
  });
});

async function setupTesting() {
  const mockUserService = {
    findUser: jest.fn().mockResolvedValue({
      username: "testUser",
      id: user.userId,
    }),
  };

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: testImportModules,
    providers: [RankService, { provide: UserService, useValue: mockUserService }],
  }).compile();

  return {
    db: moduleRef.get<DbType>(DB),
    rankService: moduleRef.get<RankService>(RankService),
  };
}
