import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import Handlebars from "handlebars";
import type { ScaffauthConfig, TemplateContext } from "../types/index.js";
import { copyTemplate } from "../utils/fileOperations.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Handlebars helpers
Handlebars.registerHelper("uppercase", (str: string) => str.toUpperCase());
Handlebars.registerHelper(
  "eq",
  (a: string, b: string) => a === b,
);
Handlebars.registerHelper(
  "or",
  (...args: unknown[]) => {
    // Last arg is the Handlebars options object
    const values = args.slice(0, -1);
    return values.some(Boolean);
  },
);

/**
 * Resolve the path to a template directory based on user selections.
 */
function getTemplatePath(config: ScaffauthConfig): string {
  const { framework, orm, database } = config;
  const templateName = `${orm}-${database}`;

  // When running from dist (bundled), templates are in dist/templates/
  // When running from src (dev), templates are in src/templates/
  const templateDir = path.resolve(__dirname, "templates", framework, templateName);

  logger.debug(`Template path: ${templateDir}`);
  return templateDir;
}

/**
 * Build a TemplateContext from ScaffauthConfig for Handlebars rendering.
 */
function buildTemplateContext(config: ScaffauthConfig): TemplateContext {
  return {
    projectName: config.projectName,
    framework: config.framework,
    database: config.database,
    orm: config.orm,
    providers: config.authConfig.providers,
    twoFactor: config.authConfig.twoFactor,
    rbac: config.authConfig.rbac,
    emailProvider: config.authConfig.emailProvider,
    // Generate a random auth secret for the .env.example
    authSecret: crypto.randomBytes(32).toString("hex"),
  };
}

/**
 * Main generator: scaffolds a full project from user config.
 */
export async function generateProject(
  config: ScaffauthConfig,
  targetDir: string,
): Promise<void> {
  const templatePath = getTemplatePath(config);
  const context = buildTemplateContext(config);

  logger.debug(`Generating project at: ${targetDir}`);
  logger.debug(`Using template: ${templatePath}`);

  // Copy template files, processing .hbs files with Handlebars
  await copyTemplate(templatePath, targetDir, context);

  logger.debug("Project generation complete");
}
