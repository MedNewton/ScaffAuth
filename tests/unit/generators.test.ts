import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScaffauthConfig } from "../../src/types/index.js";

const { copyTemplateMock, loggerDebugMock } = vi.hoisted(() => ({
  copyTemplateMock: vi.fn(),
  loggerDebugMock: vi.fn(),
}));

vi.mock("../../src/utils/fileOperations.js", () => ({
  copyTemplate: copyTemplateMock,
}));

vi.mock("../../src/utils/logger.js", () => ({
  logger: {
    debug: loggerDebugMock,
  },
}));

import { generateProject } from "../../src/generators/template.js";

describe("generateProject", () => {
  beforeEach(() => {
    copyTemplateMock.mockReset();
  });

  it("builds template context and invokes copyTemplate", async () => {
    const config: ScaffauthConfig = {
      projectName: "acme-auth",
      framework: "hono",
      database: "postgres",
      orm: "drizzle",
      authConfig: {
        emailPassword: true,
        providers: ["github", "google"],
        twoFactor: true,
        rbac: true,
        emailProvider: "resend",
        session: {
          strategy: "database-cookie-cache",
          expiresIn: 604800,
          updateAge: 86400,
          cookieCacheEnabled: true,
          cookieCacheMaxAge: 300,
        },
      },
    };

    await generateProject(config, "/tmp/acme-auth");

    expect(copyTemplateMock).toHaveBeenCalledTimes(1);

    const [templatePath, targetDir, context] = copyTemplateMock.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];

    expect(templatePath).toContain(
      path.join("templates", "hono", "drizzle-postgres"),
    );
    expect(targetDir).toBe("/tmp/acme-auth");
    expect(context.projectName).toBe("acme-auth");
    expect(context.framework).toBe("hono");
    expect(context.orm).toBe("drizzle");
    expect(context.database).toBe("postgres");
    expect(context.providers).toEqual(["github", "google"]);
    expect(context.twoFactor).toBe(true);
    expect(context.rbac).toBe(true);
    expect(context.emailProvider).toBe("resend");
    expect(context.sessionExpiresIn).toBe(604800);
    expect(context.sessionUpdateAge).toBe(86400);
    expect(context.sessionCookieCacheEnabled).toBe(true);
    expect(context.sessionCookieCacheMaxAge).toBe(300);
    expect(context.authSecret).toMatch(/^[a-f0-9]{64}$/);
  });
});
