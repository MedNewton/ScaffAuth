import { execa } from "execa";
import * as p from "@clack/prompts";
import type { ScaffauthConfig, DeployResult } from "../types/index.js";
import { logger } from "../utils/logger.js";

/**
 * Check if the Railway CLI is installed.
 */
async function checkRailwayCLI(): Promise<boolean> {
  try {
    await execa("railway", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deploy to Railway: init project, provision DB, set env vars, deploy.
 */
export async function deployToRailway(
  config: ScaffauthConfig,
  projectDir: string,
): Promise<DeployResult> {
  const spinner = p.spinner();

  // 1. Check CLI
  spinner.start("Checking Railway CLI");
  const hasRailway = await checkRailwayCLI();
  if (!hasRailway) {
    spinner.stop("Railway CLI not found");
    p.note("Install with: npm i -g @railway/cli", "Missing dependency");
    throw new Error(
      "Railway CLI is not installed. Run 'npm i -g @railway/cli' and try again.",
    );
  }
  spinner.stop("Railway CLI found");

  // 2. Initialize Railway project
  spinner.start("Creating Railway project");
  try {
    await execa("railway", ["init"], {
      cwd: projectDir,
      stdio: ["inherit", "pipe", "pipe"],
    });
    spinner.stop("Railway project created");
  } catch (err) {
    spinner.stop("Failed to create Railway project");
    logger.debug(err instanceof Error ? err.message : String(err));
    throw new Error(
      "Failed to initialize Railway project. Run 'railway login' first.",
    );
  }

  // 3. Provision PostgreSQL if using postgres
  if (config.database === "postgres") {
    spinner.start("Provisioning PostgreSQL database");
    try {
      await execa("railway", ["add", "--plugin", "postgresql"], {
        cwd: projectDir,
        stdio: ["inherit", "pipe", "pipe"],
      });
      spinner.stop("PostgreSQL database provisioned");
    } catch (err) {
      spinner.stop("Failed to provision database");
      logger.warning(
        "You may need to add a database manually in the Railway dashboard.",
      );
      logger.debug(err instanceof Error ? err.message : String(err));
    }
  }

  // 4. Deploy
  spinner.start("Deploying to Railway");
  try {
    await execa("railway", ["up", "--detach"], {
      cwd: projectDir,
      stdio: ["inherit", "pipe", "pipe"],
    });
    spinner.stop("Deployed to Railway");
  } catch (err) {
    spinner.stop("Railway deployment failed");
    logger.debug(err instanceof Error ? err.message : String(err));
    throw new Error(
      "Railway deployment failed. Try running 'railway up' in the project directory.",
    );
  }

  // 5. Get deployment URL
  let deploymentUrl = "check Railway dashboard for URL";
  try {
    const { stdout } = await execa("railway", ["domain"], {
      cwd: projectDir,
    });
    if (stdout.trim()) {
      deploymentUrl = stdout.trim();
    }
  } catch {
    logger.debug("Could not retrieve Railway domain automatically");
  }

  return { url: deploymentUrl, platform: "railway" };
}
