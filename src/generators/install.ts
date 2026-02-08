import { execa } from "execa";
import type { PackageManager } from "../utils/packageManager.js";
import { getInstallCommand } from "../utils/packageManager.js";
import { logger } from "../utils/logger.js";

/**
 * Install project dependencies using the detected package manager.
 */
export async function installDependencies(
  projectDir: string,
  pm: PackageManager,
): Promise<void> {
  const command = getInstallCommand(pm);
  const [cmd, ...args] = command.split(" ");

  logger.debug(`Running: ${command} in ${projectDir}`);

  await execa(cmd, args, {
    cwd: projectDir,
    stdio: "pipe",
  });
}
