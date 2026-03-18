export type AppRole = "viewer" | "editor" | "admin";

export interface AuthProfile {
  id: string;
  email: string | null;
  role: AppRole;
  created_at?: string;
}
