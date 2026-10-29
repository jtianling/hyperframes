import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const root = mkdtempSync(path.join(tmpdir(), "hyperframes-platform-"));
const bin = path.join(root, "bin");
mkdirSync(bin);
const browser = path.join(bin, "browser");
writeFileSync(browser, "#!/bin/sh\nexit 0\n");
chmodSync(browser, 0o755);
const fake = path.join(bin, "hyperframes");
writeFileSync(
  fake,
  `#!/usr/bin/env node
if (process.argv.includes('--fixture-wait')) {
  console.log(JSON.stringify({pid: process.pid}));
  setInterval(() => {}, 1000);
} else {
  console.log(JSON.stringify({args: process.argv.slice(2), env: {
    telemetry: process.env.HYPERFRAMES_NO_TELEMETRY,
    tracking: process.env.DO_NOT_TRACK,
    skills: process.env.HYPERFRAMES_SKIP_SKILLS,
    update: process.env.HYPERFRAMES_NO_UPDATE_CHECK,
    optional: process.env.HYPERFRAMES_NO_OPTIONAL_INSTALL,
  }}));
  process.exitCode = process.argv.includes('--fixture-fail') ? 7 : 0;
}
`,
);
chmodSync(fake, 0o755);
const wrapper = fileURLToPath(
  new URL("../skills/hyperframes/scripts/platform-cli.mjs", import.meta.url),
);
const env = {
  ...process.env,
  PATH: `${bin}${path.delimiter}${process.env.PATH}`,
  HYPERFRAMES_BROWSER_PATH: browser,
};
const run = (args, overrides = {}) =>
  spawnSync(process.execPath, [wrapper, ...args], {
    cwd: root,
    env: { ...env, ...overrides },
    encoding: "utf8",
  });
after(() => rmSync(root, { recursive: true, force: true }));

test("local invocation passes arguments and disables automatic integrations", () => {
  const result = run(["lint", "a project", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    args: ["lint", "a project", "--json"],
    env: { telemetry: "1", tracking: "1", skills: "1", update: "1", optional: "1" },
  });
});

test("unavailable browsers stop rendering before the CLI starts", () => {
  for (const command of ["render", "snapshot", "grade-compare"]) {
    for (const value of ["", "relative/browser", path.join(root, "missing")]) {
      const result = run([command], { HYPERFRAMES_BROWSER_PATH: value });
      assert.equal(result.status, 1);
      assert.equal(result.stdout, "");
      assert.match(result.stderr, /preflight failed/);
    }
  }
});

test("provider, upload, update and nested Docker commands never reach the CLI", () => {
  for (const args of [
    ["tts"],
    ["feedback"],
    ["publish"],
    ["cloud"],
    ["skills"],
    ["upgrade"],
    ["media-use"],
    ["render", "--docker"],
    ["catalog", "--on-device"],
    ["snapshot", "--describe"],
    ["audio", "--quality", "best"],
    ["catalog", "--query", "title"],
  ]) {
    const result = run(args);
    assert.equal(result.status, 1, args.join(" "));
    assert.equal(result.stdout, "");
  }
});

test("catalog metadata filters avoid the model search branch", () => {
  const result = run(["catalog", "--tag", "caption-style", "--type=block", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).args, [
    "catalog",
    "--tag",
    "caption-style",
    "--type=block",
    "--json",
  ]);
});

test("init disables automatic skill installation and transcription", () => {
  const result = run(["init", "a project"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).args, [
    "init",
    "a project",
    "--skip-skills",
    "--skip-transcribe",
    "--non-interactive",
  ]);
});

test("previews cannot automatically open a host browser", () => {
  const result = run(["preview", "--background"]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).args.includes("--no-open"));
  assert.equal(run(["preview", "--open"]).status, 1);
});

test("CLI failures and missing binaries retain concrete errors", () => {
  assert.equal(run(["render", "--fixture-fail"]).status, 7);
  const result = run(["lint"], { PATH: "" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ENOENT/);
});

test("cancellation reaches the owned CLI process", { timeout: 10000 }, async (context) => {
  const child = spawn(process.execPath, [wrapper, "render", "--fixture-wait"], {
    cwd: root,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const finished = new Promise((resolve, reject) => {
    child.once("close", (code) => resolve(code));
    child.once("error", reject);
  });
  let pid;
  context.after(() => {
    child.kill("SIGTERM");
    if (pid) {
      try {
        process.kill(pid, "SIGTERM");
      } catch (error) {
        if (error.code !== "ESRCH") throw error;
      }
    }
  });
  const output = await new Promise((resolve) => child.stdout.once("data", resolve));
  pid = JSON.parse(output.toString()).pid;
  child.kill("SIGTERM");
  assert.equal(await finished, 143);
  assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
  pid = undefined;
});
