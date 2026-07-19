import { beforeAll, describe, expect, it } from "vitest";

import { getSignInCallback, setSignInCallback, setupAuth } from "../auth";

describe("auth", () => {
  beforeAll(() => {
    setupAuth();
  });

  it("should get signIn callback and consume callback", () => {
    setSignInCallback("/main/1");

    const callback = getSignInCallback();

    expect(callback).toBe("/main/1");

    const callback2 = getSignInCallback();
    expect(callback2).toBe("/");
  });

  it("should get default callback", () => {
    const callback = getSignInCallback();

    expect(callback).toBe("/");
  });
});
