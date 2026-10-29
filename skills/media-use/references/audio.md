# 平台音频与字幕

先遵循 [平台约定](platform.md).  配音用 text_to_speech, 配乐用 music_generate.  不调用原版 audio/scripts/audio.mjs, heygen-tts.mjs, wait-bgm.mjs 或供应商 API.  这些保留的原版实现不是本 fork 的平台入口.

将确认过的文案按场景或语义段生成音频, 终态成功后从真实 localPath 接入项目 assets/audio/.  用 ffprobe 检查每段音轨时长, 再安排画面与字幕时间轴.  不假定音轨长度与请求一致, 不从文本字数推断已测时长.

字幕优先使用用户 SRT/JSON 或带真实时间戳的已有转录.  平台配音不承诺 words, 供应商 voice ID 或音色克隆.  只有分段音频和实测时长时按段对齐, 明确其精度, 不生成伪造词级时间戳.  需要识别用户录音时必须有实际 ASR 工具或已安装引擎与模型, 不自动安装, 下载或把配音文本冒充识别结果.

音效仅使用本任务已有文件或 skill 随附且许可合适的离线音效.  不新增 audio_generate, 不默认查询外部音效服务.  混音, ducking 和淡入淡出见 [mixing.md](mixing.md), CLI 通过当前 skill 的 platform-cli.mjs 执行.

有音轨的成片要分别核验音轨时长, 包/帧数量及实际信号.  视频长度正确或存在 AAC 流不能证明声音完整.  生成工具失败时报告具体原因, 不偷偷换成无声成片后声称声音已完成.
