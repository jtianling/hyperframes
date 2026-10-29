# 本地环境检查

先读 [平台接入](platform.md), 通过本 skill 的 scripts/platform-cli.mjs 调用 doctor --json.  doctor 退出码恒为零时仍需核对实际检查结果.

本地视频需要 Node 22+, 预装 CLI, 可执行的 HYPERFRAMES_BROWSER_PATH, FFmpeg/FFprobe 及 libx264 或实际使用的编码器.  缺文件, 动态库或启动失败时记录具体错误与实际路径, 不运行 browser ensure, 包管理器或浏览器安装命令.

FFmpeg 和 FFprobe 可通过实际存在的 HYPERFRAMES_FFMPEG_PATH 与 HYPERFRAMES_FFPROBE_PATH 指定, 也可使用系统 PATH.  不猜文件位置.  缺 Docker 和未启用的本地语音生成器不阻塞纯本地视频渲染, 必需项分别核对.

浏览器存在不等于 WebGL 可用.  需要软件 GL 时由平台提供兼容的浏览器与库, 再验证实际画面; 不声称已提供硬件 GPU.  内存紧张先降低 worker 数和预览质量, 不用重复启动掩盖具体错误.
