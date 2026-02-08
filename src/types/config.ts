export type Framework = "hono" | "fastify" | "express";
export type Database = "postgres" | "mysql" | "sqlite";
export type ORM = "drizzle" | "prisma" | "kysely";
export type SessionStrategy = "database" | "database-cookie-cache";

export type OAuthProvider =
  | "github"
  | "google"
  | "discord"
  | "twitter"
  | "apple"
  | "microsoft";

export type EmailProvider = "resend" | "sendgrid" | "smtp";

export type DeploymentPlatform = "vercel" | "railway";

export interface SessionConfig {
  strategy: SessionStrategy;
  expiresIn: number;
  updateAge: number;
  cookieCacheEnabled: boolean;
  cookieCacheMaxAge: number;
}

export interface AuthConfig {
  emailPassword: boolean;
  providers: OAuthProvider[];
  twoFactor: boolean;
  emailProvider?: EmailProvider;
  rbac: boolean;
  session: SessionConfig;
}

export interface DeploymentConfig {
  platform: DeploymentPlatform;
  region?: string;
  environmentVars: Record<string, string>;
}

export interface GitHubConfig {
  createRepo: boolean;
  repoName: string;
  private: boolean;
  description?: string;
}

export interface DeployResult {
  url: string;
  platform: string;
}

export interface ScaffauthConfig {
  projectName: string;
  framework: Framework;
  database: Database;
  orm: ORM;
  authConfig: AuthConfig;
  deployment?: DeploymentConfig;
  github?: GitHubConfig;
}
