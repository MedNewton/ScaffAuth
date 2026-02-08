import path from "path";
import * as p from "@clack/prompts";
import type { ScaffauthConfig, DeployResult } from "../../types/index.js";
import { gatherConfig, getDefaultConfig } from "../prompts.js";
import { generateProject } from "../../generators/template.js";
import { installDependencies } from "../../generators/install.js";
import { directoryExists } from "../../utils/fileOperations.js";
import { logger } from "../../utils/logger.js";
import { parseTemplateOption } from "../../utils/validators.js";
import {
  detectPackageManager,
  getInstallCommand,
  getRunCommand,
} from "../../utils/packageManager.js";
import { isGitInstalled, initGitRepo } from "../../utils/gitOperations.js";
import { setupGitHub, type GitHubResult } from "../../utils/github.js";
import { deployToVercel } from "../../deployers/vercel.js";
import { deployToRailway } from "../../deployers/railway.js";

export interface InitOptions {
  yes?: boolean;
  install?: boolean; // Commander sets --no-install as install=false
  git?: boolean; // Commander sets --no-git as git=false
  template?: string;
  debug?: boolean;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }
  return "Unknown error occurred";
}

function logRecoverySuggestion(context: string, err: unknown): void {
  const message = getErrorMessage(err).toLowerCase();

  if (context === "config") {
    if (message.includes("tty")) {
      logger.info("Run in an interactive terminal, or use --yes / --template.");
      return;
    }
    if (message.includes("template")) {
      logger.info(
        "Use --template in this format: framework/orm-database (e.g. hono/drizzle-postgres).",
      );
      return;
    }
  }

  if (context === "generation") {
    if (
      message.includes("enoent") ||
      message.includes("no such file") ||
      message.includes("template")
    ) {
      logger.info(
        "Template files were not found. Run npm run build, then try again.",
      );
      return;
    }
    if (message.includes("eacces") || message.includes("permission")) {
      logger.info(
        "Check write permissions for the target directory and retry.",
      );
      return;
    }
  }

  if (context === "install") {
    logger.info(
      "You can continue setup manually by installing dependencies in the generated project.",
    );
    return;
  }

  if (context === "github") {
    logger.info(
      "You can continue locally and connect GitHub later with git init/add/commit/remote/push.",
    );
    return;
  }

  if (context === "deployment") {
    logger.info(
      "You can deploy manually later from the generated project directory.",
    );
  }
}

async function resolveConfig(options: InitOptions): Promise<ScaffauthConfig> {
  if (!process.stdin.isTTY && !options.yes && !options.template) {
    throw new Error(
      "Interactive prompts require a TTY, but none was detected in this environment.",
    );
  }

  if (options.template) {
    const parsedTemplate = parseTemplateOption(options.template);
    const config = getDefaultConfig();
    config.framework = parsedTemplate.framework;
    config.orm = parsedTemplate.orm;
    config.database = parsedTemplate.database;
    logger.info(
      `Using template ${parsedTemplate.framework}/${parsedTemplate.orm}-${parsedTemplate.database}`,
    );
    logger.info(
      `Skipping prompts. Using default project name "${config.projectName}".`,
    );
    return config;
  }

  if (options.yes) {
    const config = getDefaultConfig();
    logger.info("Using default configuration (Hono + Drizzle + PostgreSQL)");
    return config;
  }

  return gatherConfig();
}

export async function runInit(options: InitOptions): Promise<void> {
  if (options.debug) {
    process.env.SCAFFAUTH_DEBUG = "1";
  }

  let config: ScaffauthConfig;
  try {
    config = await resolveConfig(options);
  } catch (err) {
    logger.error(getErrorMessage(err));
    logRecoverySuggestion("config", err);
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), config.projectName);
  logger.step(
    `Stack: ${config.framework} + ${config.orm} + ${config.database}`,
  );
  logger.step(`Target: ${targetDir}`);

  // Check if directory already exists
  if (await directoryExists(targetDir)) {
    if (!process.stdin.isTTY) {
      logger.error(
        `Directory "${config.projectName}" already exists and cannot be confirmed in non-interactive mode.`,
      );
      logger.info(
        "Use a different working directory or remove the existing directory before rerunning.",
      );
      process.exit(1);
    }

    const overwrite = await p.confirm({
      message: `Directory "${config.projectName}" already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }
  }

  // Generate project
  const spinner = p.spinner();
  spinner.start("Generating project files");

  try {
    await generateProject(config, targetDir);
    spinner.stop("Project files generated");
  } catch (err) {
    spinner.stop("Failed to generate project files");
    logger.error(getErrorMessage(err));
    logRecoverySuggestion("generation", err);
    process.exit(1);
  }

  // Install dependencies
  if (options.install !== false) {
    const pm = detectPackageManager();
    spinner.start(`Installing dependencies with ${pm}`);

    try {
      await installDependencies(targetDir, pm);
      spinner.stop("Dependencies installed");
    } catch (err) {
      spinner.stop("Failed to install dependencies");
      logger.warning("Dependency installation failed.");
      logger.info(`Manual command: ${getInstallCommand(pm)}`);
      logRecoverySuggestion("install", err);
      logger.debug(getErrorMessage(err));
    }
  }

  // Git & GitHub
  let githubResult: GitHubResult | undefined;
  const shouldGit = options.git !== false;

  if (shouldGit && config.github?.createRepo) {
    // Full GitHub flow: init git + create repo + push
    try {
      githubResult = await setupGitHub(config.github, targetDir);
    } catch (err) {
      logger.error(getErrorMessage(err));
      logRecoverySuggestion("github", err);
    }
  } else if (shouldGit) {
    // Just init a local git repo (no GitHub)
    const gitAvailable = await isGitInstalled();
    if (gitAvailable) {
      spinner.start("Initializing git repository");
      try {
        await initGitRepo(targetDir);
        spinner.stop("Git repository initialized");
      } catch (err) {
        spinner.stop("Failed to initialize git");
        logger.warning("Git initialization failed. Skipping git setup.");
        logger.debug(getErrorMessage(err));
      }
    } else {
      logger.warning("Git is not installed. Skipping git initialization.");
      logger.info("Install git and run: git init && git add -A && git commit -m \"Initial commit\"");
    }
  }

  // Deployment
  let deployResult: DeployResult | undefined;

  if (config.deployment) {
    try {
      if (config.deployment.platform === "vercel") {
        deployResult = await deployToVercel(config, targetDir);
      } else if (config.deployment.platform === "railway") {
        deployResult = await deployToRailway(config, targetDir);
      }
    } catch (err) {
      logger.error(getErrorMessage(err));
      logRecoverySuggestion("deployment", err);
    }
  }

  // Success summary
  const pm = detectPackageManager();
  logger.blank();
  p.outro("Your auth backend is ready!");
  logger.blank();

  logger.success(`Project created at ./${config.projectName}`);
  logger.info(
    `Configuration: ${config.framework}/${config.orm}-${config.database}`,
  );

  if (githubResult) {
    logger.success(`GitHub repository: ${githubResult.repoUrl}`);
  }

  if (deployResult) {
    logger.success(`Deployed to ${deployResult.platform}: ${deployResult.url}`);
  }

  logger.blank();

  if (deployResult) {
    logger.box(
      "Next steps:",
      [
        `  1. Configure OAuth credentials in your ${deployResult.platform} dashboard`,
        `  2. Test auth endpoints at ${deployResult.url}/api/auth`,
        `  3. Integrate with your frontend`,
      ].join("\n"),
    );
  } else {
    logger.box(
      "Next steps:",
      [
        `  1. cd ${config.projectName}`,
        `  2. cp .env.example .env`,
        `  3. Update DATABASE_URL in .env`,
        `  4. ${getRunCommand(pm, "db:push")}`,
        `  5. ${getRunCommand(pm, "dev")}`,
        "",
        `  Your auth backend will be running at http://localhost:3000`,
      ].join("\n"),
    );
  }
}
