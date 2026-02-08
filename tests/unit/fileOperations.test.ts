import os from "os";
import path from "path";
import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  copyTemplate,
  directoryExists,
  writeFile,
  writeJson,
} from "../../src/utils/fileOperations.js";

describe("fileOperations", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "scaffauth-fileops-"));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it("writes plain files", async () => {
    const target = path.join(tempDir, "nested", "hello.txt");
    await writeFile(target, "hello");

    expect(await fs.readFile(target, "utf-8")).toBe("hello");
  });

  it("writes JSON with pretty formatting", async () => {
    const target = path.join(tempDir, "config.json");
    await writeJson(target, { ok: true });

    expect(await fs.readFile(target, "utf-8")).toBe('{\n  "ok": true\n}\n');
  });

  it("checks whether a directory is non-empty", async () => {
    const missing = path.join(tempDir, "missing");
    expect(await directoryExists(missing)).toBe(false);

    const existing = path.join(tempDir, "existing");
    await fs.ensureDir(existing);
    expect(await directoryExists(existing)).toBe(false);

    await fs.writeFile(path.join(existing, "file.txt"), "x", "utf-8");
    expect(await directoryExists(existing)).toBe(true);
  });

  it("copies templates and renders .hbs files", async () => {
    const templateDir = path.join(tempDir, "template");
    const outputDir = path.join(tempDir, "output");

    await fs.ensureDir(path.join(templateDir, "src"));
    await fs.writeFile(
      path.join(templateDir, "src", "greeting.txt.hbs"),
      "Hello {{projectName}}",
      "utf-8",
    );
    await fs.writeFile(path.join(templateDir, "src", "static.txt"), "keep", "utf-8");

    await copyTemplate(templateDir, outputDir, {
      projectName: "my-api",
      framework: "hono",
      database: "postgres",
      orm: "drizzle",
      providers: [],
      twoFactor: false,
      rbac: false,
      emailProvider: undefined,
      authSecret: "secret",
    });

    expect(await fs.readFile(path.join(outputDir, "src", "greeting.txt"), "utf-8")).toBe(
      "Hello my-api",
    );
    expect(await fs.readFile(path.join(outputDir, "src", "static.txt"), "utf-8")).toBe(
      "keep",
    );
  });
});
