import path from "path";
import { execa } from "execa";
import * as p from "@clack/prompts";
import fs from "fs-extra";
import type { ScaffauthConfig, DeployResult } from "../types/index.js";
import { logger } from "../utils/logger.js";

/**
 * Check if the Vercel CLI is installed.
 */
async function checkVercelCLI(): Promise<boolean> {
  try {
    await execa("vercel", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a vercel.json configuration file for the project.
 */
function generateVercelConfig(_config: ScaffauthConfig): Record<string, unknown> {
  return {
    version: 2,
    builds: [
      {
        src: "src/index.ts",
        use: "@vercel/node",
      },
    ],
    routes: [
      {
        src: "/(.*)",
        dest: "src/index.ts",
      },
    ],
  };
}

/**
 * Deploy to Vercel: write config, set env vars, run deploy.
 */
export async function deployToVercel(
  config: ScaffauthConfig,
  projectDir: string,
): Promise<DeployResult> {
  const spinner = p.spinner();

  // 1. Check CLI
  spinner.start("Checking Vercel CLI");
  const hasVercel = await checkVercelCLI();
  if (!hasVercel) {
    spinner.stop("Vercel CLI not found");
    p.note("Install with: npm i -g vercel", "Missing dependency");
    throw new Error(
      "Vercel CLI is not installed. Run 'npm i -g vercel' and try again.",
    );
  }
  spinner.stop("Vercel CLI found");

  // 2. Write vercel.json
  spinner.start("Configuring Vercel project");
  const vercelConfig = generateVercelConfig(config);
  await fs.writeFile(
    path.join(projectDir, "vercel.json"),
    JSON.stringify(vercelConfig, null, 2) + "\n",
  );
  spinner.stop("Vercel configuration written");

  // 3. Link or create project (interactive - Vercel CLI handles auth)
  spinner.start("Deploying to Vercel");
  try {
    const { stdout } = await execa("vercel", ["--prod", "--yes"], {
      cwd: projectDir,
      // Vercel CLI may need terminal interaction for first-time login
      stdio: ["inherit", "pipe", "pipe"],
    });

    // Extract URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : "deployment URL unavailable";

    spinner.stop(`Deployed to Vercel: ${deploymentUrl}`);

    return { url: deploymentUrl, platform: "vercel" };
  } catch (err) {
    spinner.stop("Vercel deployment failed");
    logger.debug(err instanceof Error ? err.message : String(err));
    throw new Error(
      "Vercel deployment failed. Run 'vercel login' first, then try 'vercel --prod' in the project directory.",
    );
  }
}
