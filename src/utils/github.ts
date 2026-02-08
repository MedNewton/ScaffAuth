import { Octokit } from "@octokit/rest";
import { execa } from "execa";
import * as p from "@clack/prompts";
import type { GitHubConfig } from "../types/index.js";
import { logger } from "./logger.js";
import { initGitRepo, pushToRemote } from "./gitOperations.js";

/**
 * Try to get a GitHub token from the gh CLI, falling back to manual input.
 */
async function getGitHubToken(): Promise<string> {
  // Try gh CLI first
  try {
    const { stdout } = await execa("gh", ["auth", "token"]);
    const token = stdout.trim();
    if (token) {
      logger.debug("Using token from gh CLI");
      return token;
    }
  } catch {
    logger.debug("gh CLI not available or not authenticated");
  }

  // Fall back to manual input
  const token = await p.password({
    message: "Enter your GitHub personal access token:",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Token is required";
      }
    },
  });

  if (p.isCancel(token)) {
    throw new Error("GitHub authentication cancelled");
  }

  return token;
}

export interface GitHubResult {
  repoUrl: string;
  cloneUrl: string;
}

/**
 * Full GitHub workflow: authenticate, create repo, init git, push.
 */
export async function setupGitHub(
  config: GitHubConfig,
  projectDir: string,
): Promise<GitHubResult> {
  const spinner = p.spinner();

  // 1. Authenticate
  spinner.start("Authenticating with GitHub");
  const token = await getGitHubToken();
  const octokit = new Octokit({ auth: token });

  let username: string;
  try {
    const { data: user } = await octokit.users.getAuthenticated();
    username = user.login;
    spinner.stop(`Authenticated as ${username}`);
  } catch {
    spinner.stop("GitHub authentication failed");
    throw new Error(
      "Invalid GitHub token. Make sure it has the 'repo' scope.",
    );
  }

  // 2. Create repository
  spinner.start("Creating GitHub repository");
  let repoUrl: string;
  let cloneUrl: string;
  try {
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: config.repoName,
      private: config.private,
      description:
        config.description || "Auth backend powered by Better Auth",
      auto_init: false,
    });
    repoUrl = repo.html_url;
    cloneUrl = repo.clone_url;
    spinner.stop(`Repository created: ${repoUrl}`);
  } catch (err) {
    spinner.stop("Failed to create repository");
    if (err instanceof Error && err.message.includes("name already exists")) {
      throw new Error(
        `Repository "${config.repoName}" already exists on GitHub.`,
      );
    }
    throw err;
  }

  // 3. Init git and push
  spinner.start("Pushing code to GitHub");
  try {
    await initGitRepo(projectDir);
    await pushToRemote(projectDir, cloneUrl);
    spinner.stop("Code pushed to GitHub");
  } catch (err) {
    spinner.stop("Failed to push to GitHub");
    logger.debug(err instanceof Error ? err.message : String(err));
    throw new Error(
      "Failed to push to GitHub. Make sure git is installed and configured.",
    );
  }

  return { repoUrl, cloneUrl };
}
