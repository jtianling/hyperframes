---
name: media-use
description: Generate and integrate HyperFrames video media with monkeys managed image, video, speech and music tools, and apply local audio mixing and media treatments.
---

# 平台媒体

先读 [monkeys 平台接入](references/platform.md).  本 fork 保留原版素材接入, 音频混合和画面处理能力, 生成阶段使用 monkeys 托管工具, 不直接调用 HeyGen 或本地生成模型.

先复用当前任务的合适素材.  新素材按需要调用 image_generate, video_generate, text_to_speech 或 music_generate, 只使用当轮实际 schema.  不把这些工具当 shell 命令, 不运行原版 resolve 级联, audio.mjs 或供应商脚本, 不要求 API key, 不因未安装 heygen 就断言平台媒体不可用.  工具失败应报告实际原因, 不自动切供应商或循环付费生成.

素材获取与接入见 [resolve](references/resolve.md).  配音和分段时间轴见 [audio](references/audio.md).  字幕需要真实转录或明确标为分段对齐, TTS 不自动提供字级时间戳.

原版保留的本地处理文档按实际需求阅读, CLI 示例均经平台入口执行:

| 任务 | 参考 |
| --- | --- |
| 混音, 增益, 淡入淡出, ducking | [mixing](references/mixing.md) |
| 本地素材处理与画面效果 | [media-treatments](references/media-treatments.md) |
| 已有本地 LUT 和调色 | [grading](references/grading.md) |
| 依赖缺失与平台能力边界 | [setup-providers](references/setup-providers.md) |

只使用已存在的本地音效及合适许可证, 或用户提供的文件.  不增加 audio_generate, 不把配乐工具当任意音效或转录工具.  真实品牌标志使用用户提供或已经授权的原始素材, 不用生成图片伪造官方标志.

本地媒体处理需要的 CLI, FFmpeg, 模型和字体先检查实际可用性.  不支持的处理明确说明缺口, 不用 CSS 假效果冒充已经完成原版处理.

素材先接入项目 assets/, 用真实文件类型和相对路径引用.  最终按用户目标完成视频, 图片或交互演示, 不把一份素材当成片交付.  实际失败和未验证环节要随产物说明.
