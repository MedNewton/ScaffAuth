import type { Framework, Database, ORM } from "./config.js";

export interface TemplateContext {
  projectName: string;
  framework: Framework;
  database: Database;
  orm: ORM;
  providers: string[];
  twoFactor: boolean;
  rbac: boolean;
  emailProvider?: string;
  authSecret?: string;
}

export interface TemplateFile {
  /** Relative path within the template directory */
  source: string;
  /** Relative path in the generated project */
  destination: string;
  /** Whether to process Handlebars variables */
  isTemplate: boolean;
}
