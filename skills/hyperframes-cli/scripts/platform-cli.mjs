#!/usr/bin/env node
import { accessSync, constants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const localCommands = new Set([
  "init",
  "info",
  "compositions",
  "timeline",
  "lint",
  "check",
  "snapshot",
  "keyframes",
  "compare",
  "history",
  "render",
  "doctor",
  "preview",
  "play",
  "present",
  "catalog",
  "media-treatment",
  "grade-compare",
  "beats",
  "normalize-audio",
  "clean",
]);
const browserCommands = new Set([
  "check",
  "snapshot",
  "keyframes",
  "compare",
  "render",
  "preview",
  "play",
  "present",
  "grade-compare",
]);
const inputArgs = process.argv.slice(2);
const command = inputArgs[0];

function checkCatalog() {
  if (command !== "catalog") return;
  const flags = inputArgs.slice(1);
  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    if (flag === "--json") continue;
    if (/^--(tag|type)=.+/.test(flag)) continue;
    if (
      ["--tag", "--type"].includes(flag) &&
      flags[index + 1] &&
      !flags[index + 1].startsWith("-")
    ) {
      index += 1;
      continue;
    }
    throw new Error("Platform catalog accepts only --tag, --type and --json.");
  }
}

function prepare() {
  if (!localCommands.has(command)) {
    throw new Error(`Unsupported platform command: ${command ?? "(missing)"}.`);
  }
  if (inputArgs.some((arg) => arg === "--docker" || arg.startsWith("--docker="))) {
    throw new Error("Nested Docker rendering is not a platform command.");
  }
  if (inputArgs.some((arg) => arg === "--on-device" || arg.startsWith("--on-device="))) {
    throw new Error("On-device model setup is not a platform command.");
  }
  if (inputArgs.some((arg) => arg === "--describe" || arg.startsWith("--describe="))) {
    throw new Error("External frame descriptions are not a platform command.");
  }
  checkCatalog();
  if (browserCommands.has(command)) {
    const browser = process.env.HYPERFRAMES_BROWSER_PATH;
    if (!browser || !path.isAbsolute(browser)) {
      throw new Error("HYPERFRAMES_BROWSER_PATH must name the installed browser.");
    }
    accessSync(browser, constants.X_OK);
  }
  const initFlags =
    command === "init" ? ["--skip-skills", "--skip-transcribe", "--non-interactive"] : [];
  for (const flag of initFlags) {
    if (inputArgs.some((arg) => arg.startsWith(`${flag}=`))) {
      throw new Error(`Use ${flag} without a value.`);
    }
  }
  const preview = ["preview", "play", "present"].includes(command);
  if (preview) {
    if (
      inputArgs.some(
        (arg) => arg === "--open" || arg.startsWith("--open=") || arg.startsWith("--no-open="),
      )
    ) {
      throw new Error("Use --no-open for platform previews.");
    }
  }
  const flags = [...initFlags, ...(preview ? ["--no-open"] : [])];
  return [...inputArgs, ...flags.filter((flag) => !inputArgs.includes(flag))];
}

try {
  const args = prepare();
  const child = spawn("hyperframes", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      HYPERFRAMES_NO_TELEMETRY: "1",
      DO_NOT_TRACK: "1",
      HYPERFRAMES_SKIP_SKILLS: "1",
      HYPERFRAMES_NO_UPDATE_CHECK: "1",
      HYPERFRAMES_NO_OPTIONAL_INSTALL: "1",
    },
  });
  const forwardInterrupt = () => child.kill("SIGINT");
  const forwardTerminate = () => child.kill("SIGTERM");
  process.on("SIGINT", forwardInterrupt);
  process.on("SIGTERM", forwardTerminate);
  child.on("error", (error) => {
    console.error(`Hyperframes launch failed: ${error.code}: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) console.error(`Hyperframes exited on signal: ${signal}.`);
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : signal === "SIGTERM" ? 143 : 1);
  });
  child.on("close", () => {
    process.removeListener("SIGINT", forwardInterrupt);
    process.removeListener("SIGTERM", forwardTerminate);
  });
} catch (error) {
  console.error(`Hyperframes preflight failed: ${error.message}`);
  process.exitCode = 1;
}
