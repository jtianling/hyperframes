# monkeys 平台接入

本 fork 原版为 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes), 修改版为 [jtianling/hyperframes](https://github.com/jtianling/hyperframes).  保留 HTML, 时间轴, 动效, 布局和逐帧检查指导.  本文约定适用于本 fork 的全部发布 skill.  维护源为 hyperframes/references/platform.md, 副本由 scripts/sync-monkeys-platform.mjs 同步.

## 本地 CLI

文档中的 hyperframes 或 npx hyperframes 示例只表示命令语法.  在当前任务的项目工作目录中, 实际统一使用当前 skill 内的本地入口:

```bash
node <SKILL_DIR>/scripts/platform-cli.mjs <command> <args...>
```

SKILL_DIR 为本次真实加载的 skill 目录, 不猜绝对路径.  入口调用 PATH 中已经安装的 hyperframes, 不通过 npm 或 npx 下载 CLI.  缺包时记录具体错误, 由平台维护者处理, 不自动安装或改用 latest.  本次上游 CLI 指导版本为 0.8.216, 不代表沙箱已经安装或兼容该版本.

入口为子进程设置 HYPERFRAMES_NO_TELEMETRY=1, DO_NOT_TRACK=1, HYPERFRAMES_SKIP_SKILLS=1 , HYPERFRAMES_NO_UPDATE_CHECK=1 和 HYPERFRAMES_NO_OPTIONAL_INSTALL=1.  不自行绕过入口运行 feedback, events, usage, auth, skills, upgrade, publish, cloud, lambda, cloudrun, open 或供应商生成命令.  snapshot 默认关闭外部描述, 示例不需要 --describe false; 不执行 --describe 或带远端分析分支的 audio 命令.  catalog 只接受 tag/type 元数据筛选和 JSON 输出, 不开放 query/words/on-device 的模型搜索分支.  原版 --query 示例在平台改用元数据筛选, 需要进一步挑选时读取结果或项目现有组件源码.  不使用 plugin-cli.mjs 的 npm 下载路径.

浏览器相关命令要求平台提供真实可执行的绝对 HYPERFRAMES_BROWSER_PATH, 缺失时在启动前失败, 不触发浏览器自动下载.  init 自动附加 --skip-skills 和 --skip-transcribe, 不自动安装 skill 或转录模型.  预览命令自动附加 --no-open.  不在沙箱内启动 Docker.  入口限制命令面, 不替代沙箱网络隔离或证明组合页面没有远程资源.

## 项目与依赖

项目, 素材, 输出和诊断日志放在当前任务可写工作区.  skill 目录作为只读输入, 不在其中写项目, 不读取 .env 或 .env.*.  遵守用户已有改动, 只清理本任务明确拥有的进程和临时文件.

先确认 Node 22+, 已安装 CLI, 浏览器, FFmpeg/FFprobe 和实际编码器.  保留匹配的浏览器版本, 字体和软件 GL 能力; 普通渲染从有界 CPU 并发开始, 不假设硬件 GPU 可用.  doctor 的退出码恒为零时还需读取检查结果, 缺 Docker 或未启用的本地生成器不等于本地视频渲染失败.

素材, GSAP 等页面脚本和字体必须在渲染前本地化并具有可用许可证, 不依赖运行时 CDN 或 Google Fonts.  指定字体文件后等待 document.fonts.ready, 中文和字重通过实际关键帧检查.  不假设 pdf-base 的字体路径在视频沙箱也存在.

完整视频流程需要 hyperframes, hyperframes-cli, hyperframes-registry, media-use 四个核心 skill.  接入时需让平台实际加载它们, 不在任务中安装缺失 skill.  单个入口内的 CLI wrapper 和本文可独立使用, 不代表其他 skill 或其私有资源自动存在.

## 平台媒体

| 素材 | 工具 |
| --- | --- |
| 图片, 插画, 背景 | `image_generate` |
| 视频素材 | `video_generate` |
| 配音 | `text_to_speech` |
| 配乐 | `music_generate` |

先复用本任务已有且合适的素材, 只为用户当前目标调用所需工具.  按当轮实际 schema 调用, 不把工具当 shell 命令, 不猜平台 API, 不要求 HeyGen, Gemini 或其他供应商 key.  不运行原版 audio.mjs, resolve 的供应商级联或本地模型安装流程.  已获授权的同一任务不重复确认, 工具失败时报告具体原因, 不自行切供应商或循环付费生成.

按工具实际提供的状态机制等待终态.  成功后使用结果明确给出的 localPath, 检查文件存在, 非空及类型, 再复制到项目 assets/ 下.  不从 URL, 文件名或任务 ID 猜本地路径.  引用使用 assets/... 相对地址, 不嵌入沙箱绝对路径.  图片检查尺寸, 音视频用 ffprobe 分别核验流和时长.  生成素材仍需完成接入和成片检查.

配音按场景或语义段生成并实测各段时长.  平台 TTS 不保证词级时间戳, 克隆音色或供应商 voice ID.  有真实词级转录才做逐词高亮, 仅有分段时间时明确采用分段字幕, 不伪造 words.  自动 ASR 需另有平台真实工具或已安装的引擎与模型, 不把配音工具当转录, 不自动下载模型.  音效使用用户文件或已随 skill 提供且许可合适的本地音效, 不增加 audio_generate; 不用生成图片冒充真实品牌标志.

## 预览, 导出与交付

用户需要交互预览时, 只有在平台实际提供持久进程和端口代理后才启动 preview, play 或 present.  核验 readiness 和 HTTP 响应, 交付平台真实提供的预览 URL, 不将沙箱 localhost 当作用户可访问地址, 不自动下载或推销桌面 app, 不创建外部隧道或上传项目.

没有预览代理时使用 snapshot 的本地 PNG 检查画面.  用户要求制作视频或交付 MP4 时, 检查通过后继续本地 render, 不强制停在 Studio 等待.  只要预览或咨询时不额外渲染整片.  交互幻灯片需有真实可访问预览或可用离线项目交付, 不把静帧冒充可交互演示.

长渲染使用平台实际后台执行和状态机制, 保存退出码与日志, 未知状态先检查任务, 不盲目重启.  失败时报告命令, 阶段和具体原因, 保留可用诊断材料.  最终检查解码画面, 尺寸, 帧率, 时长, 中文及字幕; 音轨单独核验时长和信号, 不以存在 AAC 流证明配音或音乐正确.

按当轮交付工具的真实 schema 使用工作区相对路径或结果明确给出的 deliveryPath.  不猜路径, 不重复发送已自动交付素材.  缺渲染环境时明确列出缺口, 不把源码或模型自述称为成片完成.  本地适配不证明沙箱镜像, 预览代理或生产 agent 已接通.
