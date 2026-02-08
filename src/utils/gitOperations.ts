import { execa } from "execa";
import { logger } from "./logger.js";

/**
 * Check if git is available on the system.
 */
export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa("git", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize a git repository, stage all files, and create an initial commit.
 */
export async function initGitRepo(projectDir: string): Promise<void> {
  logger.debug(`Initializing git repo in ${projectDir}`);

  await execa("git", ["init"], { cwd: projectDir });
  await execa("git", ["add", "-A"], { cwd: projectDir });
  await execa("git", ["commit", "-m", "Initial commit from Scaffauth"], {
    cwd: projectDir,
  });
}

/**
 * Add a remote origin and push to it.
 */
export async function pushToRemote(
  projectDir: string,
  remoteUrl: string,
): Promise<void> {
  logger.debug(`Adding remote: ${remoteUrl}`);

  await execa("git", ["remote", "add", "origin", remoteUrl], {
    cwd: projectDir,
  });
  await execa("git", ["branch", "-M", "main"], { cwd: projectDir });
  await execa("git", ["push", "-u", "origin", "main"], { cwd: projectDir });
}
