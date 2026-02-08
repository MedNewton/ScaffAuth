import { Command } from "commander";
import { runInit } from "./commands/init.js";
import packageJson from "../../package.json";

const program = new Command();

program
  .name("create-scaffauth")
  .description("Scaffold production-ready Better Auth backends")
  .version(packageJson.version);

program
  .command("init", { isDefault: true })
  .description("Initialize a new auth backend project")
  .option("-y, --yes", "Skip prompts and use defaults")
  .option("--no-install", "Skip package installation")
  .option("--no-git", "Skip git initialization")
  .option("-t, --template <template>", "Use a specific template")
  .option("-d, --debug", "Enable debug mode")
  .action(runInit);

program.parse();
