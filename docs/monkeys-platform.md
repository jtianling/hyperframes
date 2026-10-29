# monkeys 平台 skill 适配

原版为 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes), 本 fork 为 [jtianling/hyperframes](https://github.com/jtianling/hyperframes).  适配基于 e1a8c7f1730149a81d5aa5863b963487a2e3955e, CLI 指导版本 0.8.216.  原作者归属和 Apache-2.0 许可证保留.

发布的七个 skill 均携带 [平台约定](../skills/hyperframes/references/platform.md) 和本地 CLI wrapper.  视频设计, HTML 时间轴, 渲染和原版技术指导保留, 媒体生成改用 monkeys 的 image_generate, video_generate, text_to_speech 和 music_generate.  不启用 audio_generate, 不要求终端用户配置供应商 key.

wrapper 调用 PATH 中已安装的 hyperframes, 关闭遥测, 自动 skill 安装, 可选依赖安装和升级检查.  本地命令有显式允许列表, 未开放供应商生成, 外部音频/画面分析, 模型搜索, 反馈上传, 项目发布和云渲染.  浏览器路径必须真实可执行.  init 跳过 skill 安装与转录, 预览禁止自动打开宿主机浏览器, 取消信号转发给本任务子进程.  它不是网络防火墙, 组合页面仍需本地化素材和字体, registry 查询也可能请求目录元数据.

目标镜像需要 Node 22+, 固定版本 HyperFrames CLI, 匹配浏览器与系统库, FFmpeg/FFprobe, 字体和可写工作区.  完整视频 agent 需要实际加载 hyperframes, hyperframes-cli, hyperframes-registry 和 media-use 四个核心 skill.  额外 Figma connector, ASR 或重型 3D 能力不因安装 skill 自动提供.

交互预览依赖平台持久进程和端口代理; 未提供时可检查本地关键帧并继续用户要求的成片渲染.  幻灯片不能用视频或静帧冒充已交付交互.  字幕优先真实转录, 平台 TTS 没有词级时间时只做明确的分段同步.  原版供应商实现保留作为来源代码, 不作为平台任务入口.

同步与定向验证:

```bash
node scripts/sync-monkeys-platform.mjs
node scripts/sync-monkeys-platform.mjs --check
node scripts/check-core-skills.mjs
node scripts/check-skill-mirror.mjs
node --test tests/monkeys-platform-cli.test.mjs
git diff --check
```

本轮验证范围为 skill 元数据, 链接, 副本一致性和 wrapper 的真实子进程边界.  wrapper 测试使用隔离的模拟 CLI, 不等于 HyperFrames 引擎渲染验收.  本轮未安装引擎, 调用付费媒体, 构建镜像, 上传 skill, 修改线上 agent 或发布生产环境.  真实目标沙箱还需验证中文多场景视频, 音轨, 关键帧, 预览代理和成片下载.

本机副本位于 ~/workspace/monkeys-workspace/skill-repos/hyperframes.  为避免下载仓库中的大量演示媒体, 初次采用浅层部分克隆和 sparse checkout, Git origin 仍指向本 fork.  如需编辑其他源码, 先通过 git sparse-checkout add 检出对应目录, 不覆盖现有变更.
