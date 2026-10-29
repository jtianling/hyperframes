# 平台依赖与能力检查

先读 [平台约定](platform.md).  生成阶段使用当轮实际提供的托管工具, 不安装 HeyGen, Kokoro, FLUX, Parakeet, Whisper 或 LTX 作为供应商兜底.  不要求终端用户配置 API key, OAuth 或本机 CLI.

本地渲染检查 Node, 已安装 HyperFrames CLI, 真实浏览器路径, FFmpeg/FFprobe, 编码器与字体.  工具目录可用不等于项目依赖可解析, 普通浏览器通过不等于 WebGL 或 ASR 可用.  缺少任何本次必需能力时报告实际检查项和具体错误, 不自动下载修复.

生成工具由平台管理供应商, 计费和状态, 此 skill 不查询 HeyGen 账户用量, 不代用户开通第三方付费服务.  特定 avatar, 翻译配音或音色克隆只有当轮平台工具明确支持时才承诺, 普通 video_generate 或 text_to_speech 不证明这些专属能力存在.

本地 skill 适配不表示目标沙箱已构建或上线.  镜像, 引擎固定版本, 浏览器, 任务执行和产物下载需在目标环境分别验收.
