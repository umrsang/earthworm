import type { SetupUserApiResponse } from "~/api/user";
import { type UserApiResponse } from "~/api/user";

export interface SetupUser extends SetupUserApiResponse {}

export interface User {
  id: string;
  username: string;
  name?: string;
  avatar: string;
  membership: {
    isMember: boolean;
    details: {
      endDate: string;
      type: string;
      startDate: string;
    } | null;
  };
}
