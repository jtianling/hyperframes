---
name: hyperframes-cli
description: The HyperFrames CLI by job - scaffold, check, look at frames, edit the timeline, preview, render locally or in the cloud, publish, project history - plus reading its JSON and recovering from build or render failures.
---

先读 [monkeys 平台接入](references/platform.md), 使用本 skill 的 platform-cli.mjs 和平台媒体工具.  本文优先于原版安装, 云服务和交付流程.

# HyperFrames CLI

命令示例统一经本 skill 的 scripts/platform-cli.mjs 执行, 不使用 npx 下载路径. It needs Node.js 22+ and FFmpeg. Every command has `--help`; most take `--json`, and a failure prints `✗ …`, a `Fix:` line and exits non-zero.

## Commands by job

| Job | Commands |
| --- | --- |
| Start | `init <dir>` (blank; `--example <name>` only when asked), `capture <url>` |
| Read a project | `info`, `compositions`, `timeline --json`, `docs <topic>` |
| Check it | `lint` while writing; `check --json` as the gate (lint, runtime, layout, contrast) |
| Look at it | `snapshot` (`--at <t,…>`, `--range START,END`, `--composition <id>`, `--zoom`, `--angle`, `--against <video>`), `keyframes`, `compare` |
| Edit the timeline | `timeline` with `move`, `trim`, `split`, `set`, `duplicate`, `delete`, `apply`, `undo`, `ids` |
| Reuse | `catalog`, `add` (`/hyperframes-registry`) |
| Media and sound | 平台媒体工具 (`/media-use`); 本地 `media-treatment`, `grade-compare`, `beats`, `normalize-audio` |
| Show and ship | `preview`, `present` (`/slideshow`), `render`; 由平台交付工具交付 |
| Upkeep | `doctor`, `clean`; 不自动安装, 更新, 查用量或发送反馈 |

`validate`, `inspect` and `layout` are deprecated aliases of `check`; `events` is telemetry for skills' own scripts. Don't run them.

## The loop

1. Write, then `npx hyperframes lint` after the first pass and after structural changes.
2. `npx hyperframes check --json` and fix every error. While a lint error remains the layout and contrast audits don't run; "0 samples" means nothing was checked. Contrast failures carry a `suggestedColor`. A finding at a single sample (an entrance in flight) is info; a 3 s+ video with no visible change fails `sweep_static`.
3. `npx hyperframes snapshot` and read the PNGs (under `.hyperframes/artifacts/snapshots/`): that is how you see the video. With sub-compositions, snapshot a midpoint of every scene; tiny unstyled content or a missing hero is a mount defect (`../hyperframes/references/format.md`).
4. 用户需要交互预览且平台有端口代理时启动 preview, 核验可访问地址.  无代理则用 snapshot 检查.  用户要求成片时继续导出.
5. When it is time to render (step 4): `npx hyperframes render --quality looks --output out.mp4` (`draft` while iterating, `delivery` for the final). Confirm the file is non-empty and its `ffprobe` duration matches the root `data-duration`, then look at decoded frames.

"This element" or the current selection: `npx hyperframes preview --context --json --context-fields selection`; `no-selection` means ask them to click it.

## Edit the timeline

These are the edits Studio itself makes, so the result stays in Studio's shape.

- `timeline --json` lists clips with absolute `absStart`/`absEnd`, owning `file` and the `#id` ref the edit commands take (`timeline ids` stamps missing ids).
- `timeline move|trim|split|set|duplicate|delete <ref> … --plan --json` previews one edit; run it again without `--plan`. `--start`, `--end`, `--duration` set one edge or the length.
- An edit is refused when the clip would overlap a neighbour (`--overwrite`, or move the neighbour first) or end past its composition: raise the root's `data-duration` first. No command changes `data-duration`.
- Several edits at once: a JSON file such as `[{"verb": "move", "ref": "#outro", "time": "9"}]`, then `timeline apply plan.json --json`. Each run prints a `receipt`; save it and `timeline undo receipt.json` reverts it.

<!-- history (trial): remove this block together with the command -->

## Project history

Every write is kept and can be undone. At the start of a turn, `npx hyperframes history begin --who <you> --label "<plan>"`, then `history --since mine --who <you>` to see what the person changed; build on their edits. A check failed or they say it got worse: `history undo --who <you>`, never hand-edit back. End the turn with `history end`.

<!-- /history (trial) -->

## 本地渲染

使用 render 将文件写入任务工作区, 不运行 --docker 或云渲染.  长命令采用平台实际后台执行和状态机制, 日志留在工作区; 未知状态先检查任务再决定续做, 不依据固定一分钟或两分钟估计重启.

不运行 feedback 或上传复现资料.  失败信息和可用产物通过当前平台交付机制告知用户.

## When a command fails

| Symptom | Fix |
| --- | --- |
| Chrome missing or won't start | 核对 HYPERFRAMES_BROWSER_PATH 和具体启动错误; 不下载浏览器. doctor 需检查结果, 不只看退出码 |
| A heavy page isn't ready in time | Raise `--timeout` on `check` or `snapshot` |
| Unusual codec looks blank | Keep `--proxy` on (the default) |
| Render slow on Linux | The summary's second line says `screenshot` + `software gpu`: the slow path |
| `capture` fails or writes `BLOCKED.md` | Take nothing from its partial files; retry into a new `-o` folder |
| Disk tight | `clean --dry-run`, then `clean`; never delete `.hyperframes` (it holds history) |

## References

Read the row before running its command.

| Commands | Read |
| --- | --- |
| `init` | `references/init-and-scaffold.md` |
| `lint`, `check`, motion sidecars, `snapshot` | `references/lint-validate-inspect.md` |
| `compare`, `grade-compare`, `render --batch` | `references/compare-and-batch.md` |
| `beats` | `references/beats.md` |
| `preview`, `play`, `render`, Studio context | `references/preview-render.md` |
| `doctor` | `references/doctor-browser.md` |
| `info`, `compositions`, `timeline` | `references/upgrade-info-misc.md` |
| `--strict` flags, run ids, `clean`, shader lint, JSON paths | `references/conventions.md` |
| `keyframes` | `../hyperframes/references/motion.md` (Seeing motion) |
