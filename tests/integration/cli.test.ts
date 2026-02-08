import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  spinnerStartMock: vi.fn(),
  spinnerStopMock: vi.fn(),
  generateProjectMock: vi.fn(),
  installDependenciesMock: vi.fn(),
  directoryExistsMock: vi.fn(),
  isGitInstalledMock: vi.fn(),
  initGitRepoMock: vi.fn(),
  setupGitHubMock: vi.fn(),
  deployToVercelMock: vi.fn(),
  deployToRailwayMock: vi.fn(),
  loggerMock: {
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    debug: vi.fn(),
    blank: vi.fn(),
    box: vi.fn(),
  },
}));

vi.mock("@clack/prompts", () => ({
  spinner: () => ({
    start: mocks.spinnerStartMock,
    stop: mocks.spinnerStopMock,
  }),
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  outro: vi.fn(),
}));

vi.mock("../../src/generators/template.js", () => ({
  generateProject: mocks.generateProjectMock,
}));

vi.mock("../../src/generators/install.js", () => ({
  installDependencies: mocks.installDependenciesMock,
}));

vi.mock("../../src/utils/fileOperations.js", () => ({
  directoryExists: mocks.directoryExistsMock,
}));

vi.mock("../../src/utils/logger.js", () => ({
  logger: mocks.loggerMock,
}));

vi.mock("../../src/utils/packageManager.js", () => ({
  detectPackageManager: vi.fn(() => "npm"),
  getInstallCommand: vi.fn(() => "npm install"),
  getRunCommand: vi.fn((_pm: string, script: string) => `npm run ${script}`),
}));

vi.mock("../../src/utils/gitOperations.js", () => ({
  isGitInstalled: mocks.isGitInstalledMock,
  initGitRepo: mocks.initGitRepoMock,
}));

vi.mock("../../src/utils/github.js", () => ({
  setupGitHub: mocks.setupGitHubMock,
}));

vi.mock("../../src/deployers/vercel.js", () => ({
  deployToVercel: mocks.deployToVercelMock,
}));

vi.mock("../../src/deployers/railway.js", () => ({
  deployToRailway: mocks.deployToRailwayMock,
}));

import { runInit } from "../../src/cli/commands/init.js";

describe("runInit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.directoryExistsMock.mockResolvedValue(false);
    mocks.generateProjectMock.mockResolvedValue(undefined);
    mocks.installDependenciesMock.mockResolvedValue(undefined);
    mocks.isGitInstalledMock.mockResolvedValue(false);
    mocks.initGitRepoMock.mockResolvedValue(undefined);
    mocks.setupGitHubMock.mockResolvedValue(undefined);
    mocks.deployToVercelMock.mockResolvedValue(undefined);
    mocks.deployToRailwayMock.mockResolvedValue(undefined);
  });

  it("runs default flow with --yes without prompts", async () => {
    await runInit({ yes: true, install: false, git: false });

    expect(mocks.generateProjectMock).toHaveBeenCalledTimes(1);
    const [config] = mocks.generateProjectMock.mock.calls[0] as [
      Record<string, unknown>,
    ];
    expect(config.framework).toBe("hono");
    expect(config.orm).toBe("drizzle");
    expect(config.database).toBe("postgres");
    expect(mocks.installDependenciesMock).not.toHaveBeenCalled();
  });

  it("uses --template and skips prompt flow", async () => {
    await runInit({
      template: "fastify/prisma-mysql",
      install: false,
      git: false,
    });

    expect(mocks.generateProjectMock).toHaveBeenCalledTimes(1);
    const [config] = mocks.generateProjectMock.mock.calls[0] as [
      Record<string, unknown>,
    ];
    expect(config.framework).toBe("fastify");
    expect(config.orm).toBe("prisma");
    expect(config.database).toBe("mysql");
  });

  it("exits on invalid --template input", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((code?: number) => {
        throw new Error(`exit:${code ?? 0}`);
      }) as never);

    await expect(
      runInit({ template: "invalid", install: false, git: false }),
    ).rejects.toThrow("exit:1");

    exitSpy.mockRestore();
  });

  it("continues when dependency installation fails", async () => {
    mocks.installDependenciesMock.mockRejectedValueOnce(new Error("install failed"));

    await runInit({ yes: true, install: true, git: false });

    expect(mocks.installDependenciesMock).toHaveBeenCalledTimes(1);
    expect(mocks.loggerMock.warning).toHaveBeenCalledWith(
      "Dependency installation failed.",
    );
    expect(mocks.generateProjectMock).toHaveBeenCalledTimes(1);
  });
});
