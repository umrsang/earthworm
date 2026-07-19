export interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  avatar: string | null;
  createdAt: Date;
  isActive: boolean;
}
