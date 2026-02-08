import fs from "fs-extra";
import path from "path";
import Handlebars from "handlebars";
import type { TemplateContext } from "../types/index.js";

/**
 * Copy a template directory to the target, processing .hbs files with Handlebars.
 */
export async function copyTemplate(
  templateDir: string,
  targetDir: string,
  context: TemplateContext,
): Promise<void> {
  await fs.ensureDir(targetDir);

  const entries = await fs.readdir(templateDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);
    let destName = entry.name;

    // Strip .hbs extension from destination
    if (destName.endsWith(".hbs")) {
      destName = destName.slice(0, -4);
    }

    const destPath = path.join(targetDir, destName);

    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath, context);
    } else if (entry.name.endsWith(".hbs")) {
      // Process as Handlebars template
      const content = await fs.readFile(srcPath, "utf-8");
      const template = Handlebars.compile(content);
      const rendered = template(context);
      await fs.writeFile(destPath, rendered, "utf-8");
    } else {
      // Copy as-is
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * Write a JSON object to a file with pretty formatting.
 */
export async function writeJson(
  filePath: string,
  data: Record<string, unknown>,
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Write a string to a file, creating parent directories if needed.
 */
export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Check if a directory already exists and is non-empty.
 */
export async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) return false;
    const files = await fs.readdir(dir);
    return files.length > 0;
  } catch {
    return false;
  }
}
