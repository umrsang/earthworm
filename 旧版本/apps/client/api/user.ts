import type { MembershipType, SetupUser, User } from "~/types";
import { getHttp } from "./http";

export interface SetupUserApiResponse {
  avatar: string;
  username: string;
}

export interface UserApiResponse {
  membership: {
    details: {
      endDate: string;
      type: MembershipType;
      startDate: string;
    } | null;
    isMember: boolean;
  };
}

export async function fetchSetupNewUser(data: { username: string; avatar: string }) {
  const http = getHttp();
  return (await http<SetupUserApiResponse>("/user/setup", {
    method: "post",
    body: data,
  })) as SetupUser;
}

export async function fetchCurrentUser() {
  const http = getHttp();
  const extraInfo = await http<UserApiResponse>("/user", { method: "get" });

  return {
    username: "",
    avatar: "",
    id: "1",
    ...extraInfo,
  } as User;
}
