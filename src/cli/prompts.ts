import * as p from "@clack/prompts";
import type {
  ScaffauthConfig,
  Framework,
  Database,
  ORM,
  OAuthProvider,
  EmailProvider,
  DeploymentPlatform,
} from "../types/index.js";
import { validateProjectName } from "../utils/validators.js";

export async function gatherConfig(): Promise<ScaffauthConfig> {
  p.intro("Welcome to Scaffauth!");

  // --- Project name ---
  const projectName = await p.text({
    message: "What is your project name?",
    placeholder: "my-auth-backend",
    validate: validateProjectName,
  });
  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- Framework ---
  const framework = await p.select({
    message: "Which backend framework?",
    options: [
      {
        value: "hono" as Framework,
        label: "Hono",
        hint: "Modern, fast, edge-compatible (recommended)",
      },
      {
        value: "fastify" as Framework,
        label: "Fastify",
        hint: "Battle-tested, huge ecosystem",
      },
      {
        value: "express" as Framework,
        label: "Express",
        hint: "Most familiar, largest community",
      },
    ],
  });
  if (p.isCancel(framework)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- Database ---
  const database = await p.select({
    message: "Which database?",
    options: [
      {
        value: "postgres" as Database,
        label: "PostgreSQL",
        hint: "Production-grade (recommended)",
      },
      {
        value: "mysql" as Database,
        label: "MySQL",
        hint: "Popular alternative",
      },
      {
        value: "sqlite" as Database,
        label: "SQLite",
        hint: "Quick local development",
      },
    ],
  });
  if (p.isCancel(database)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- ORM ---
  const orm = await p.select({
    message: "Which ORM / query builder?",
    options: [
      {
        value: "drizzle" as ORM,
        label: "Drizzle",
        hint: "Best TypeScript DX (recommended)",
      },
      {
        value: "prisma" as ORM,
        label: "Prisma",
        hint: "Most popular, great tooling",
      },
      {
        value: "kysely" as ORM,
        label: "Kysely",
        hint: "Type-safe SQL query builder",
      },
    ],
  });
  if (p.isCancel(orm)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- OAuth providers ---
  const providers = await p.multiselect({
    message: "Which OAuth providers? (Space to select, Enter to confirm)",
    options: [
      { value: "github" as OAuthProvider, label: "GitHub" },
      { value: "google" as OAuthProvider, label: "Google" },
      { value: "discord" as OAuthProvider, label: "Discord" },
      { value: "twitter" as OAuthProvider, label: "Twitter/X" },
      { value: "apple" as OAuthProvider, label: "Apple" },
      { value: "microsoft" as OAuthProvider, label: "Microsoft" },
    ],
    required: false,
  });
  if (p.isCancel(providers)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- Two-factor auth ---
  const twoFactor = await p.confirm({
    message: "Enable two-factor authentication (2FA)?",
    initialValue: false,
  });
  if (p.isCancel(twoFactor)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- Email provider ---
  const useEmail = await p.confirm({
    message: "Set up email verification & password reset?",
    initialValue: false,
  });
  if (p.isCancel(useEmail)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  let emailProvider: EmailProvider | undefined;
  if (useEmail) {
    const provider = await p.select({
      message: "Which email provider?",
      options: [
        {
          value: "resend" as EmailProvider,
          label: "Resend",
          hint: "Modern email API (recommended)",
        },
        {
          value: "sendgrid" as EmailProvider,
          label: "SendGrid",
          hint: "Enterprise-grade email",
        },
        {
          value: "smtp" as EmailProvider,
          label: "SMTP",
          hint: "Any SMTP server",
        },
      ],
    });
    if (p.isCancel(provider)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }
    emailProvider = provider;
  }

  // --- RBAC ---
  const rbac = await p.confirm({
    message: "Enable role-based access control (RBAC)?",
    initialValue: false,
  });
  if (p.isCancel(rbac)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // --- GitHub repo ---
  const createGitHubRepo = await p.confirm({
    message: "Create a GitHub repository?",
    initialValue: false,
  });
  if (p.isCancel(createGitHubRepo)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  let githubConfig: ScaffauthConfig["github"] | undefined;
  if (createGitHubRepo) {
    const repoPrivate = await p.confirm({
      message: "Make the repository private?",
      initialValue: false,
    });
    if (p.isCancel(repoPrivate)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }
    githubConfig = {
      createRepo: true,
      repoName: projectName,
      private: repoPrivate,
    };
  }

  // --- Deployment ---
  const deploy = await p.confirm({
    message: "Deploy now?",
    initialValue: false,
  });
  if (p.isCancel(deploy)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  let deploymentConfig: ScaffauthConfig["deployment"] | undefined;
  if (deploy) {
    const platform = await p.select({
      message: "Which platform?",
      options: [
        {
          value: "vercel" as DeploymentPlatform,
          label: "Vercel",
          hint: "Serverless, edge-optimized",
        },
        {
          value: "railway" as DeploymentPlatform,
          label: "Railway",
          hint: "Full-stack platform",
        },
      ],
    });
    if (p.isCancel(platform)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }
    deploymentConfig = {
      platform,
      environmentVars: {},
    };
  }

  return {
    projectName,
    framework,
    database,
    orm,
    authConfig: {
      emailPassword: true,
      providers: providers as OAuthProvider[],
      twoFactor,
      emailProvider,
      rbac,
    },
    deployment: deploymentConfig,
    github: githubConfig,
  };
}

/**
 * Return a config with sensible defaults (used with --yes flag).
 */
export function getDefaultConfig(
  projectName = "scaffauth-project",
): ScaffauthConfig {
  return {
    projectName,
    framework: "hono",
    database: "postgres",
    orm: "drizzle",
    authConfig: {
      emailPassword: true,
      providers: ["github"],
      twoFactor: false,
      rbac: false,
    },
  };
}
