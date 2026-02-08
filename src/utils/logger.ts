import chalk from "chalk";

export const logger = {
  info(message: string) {
    console.log(chalk.blue("i"), message);
  },

  success(message: string) {
    console.log(chalk.green("✓"), message);
  },

  warning(message: string) {
    console.log(chalk.yellow("⚠"), message);
  },

  error(message: string) {
    console.log(chalk.red("✗"), message);
  },

  step(message: string) {
    console.log(chalk.cyan("→"), message);
  },

  debug(message: string) {
    if (process.env.SCAFFAUTH_DEBUG) {
      console.log(chalk.gray("[debug]"), message);
    }
  },

  blank() {
    console.log();
  },

  box(title: string, content: string) {
    console.log();
    console.log(chalk.bold(title));
    console.log(content);
    console.log();
  },
};
