# 平台固定版本与维护

本 fork 在 monkeys 由平台冻结和加载, 先读 [平台接入](platform.md).  不在视频任务中运行 skills install/update/check, npx skills, plugin-cli.mjs 的 npm bootstrap 或自动 CLI 升级, 不因原版 stderr 提示就覆盖本 fork.

使用当前 skill 的 scripts/platform-cli.mjs 调用已安装引擎.  缺少核心 skill, 浏览器或引擎时报告具体缺口, 由平台维护者提供固定版本.  插件管理器和本机桌面 app 不属于本平台任务环境.

用户明确要求维护 fork 或升级依赖时, 在授权的本地仓库由维护者处理, 核对版本兼容和代表产物后再更新冻结来源.  普通视频请求不授权发布项目, 上传源码或改生产配置.
