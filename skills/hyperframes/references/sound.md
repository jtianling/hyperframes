# Sound

Sound is half of how a film feels, and the viewer notices a silent one before any frame. Every judge of frames misses it, so plan it on purpose.

## 1. The default

- **A film over about 15 s that tells something** (launch, explainer, recap, PR video) gets a music bed and sounds on its visible actions, unless the person asked for silence or it is made to play muted (a looping background, a feed that autoplays without sound: then the type and the pictures carry it alone).
- **A voiceover** only when the request or the source calls for one (`SKILL.md`).
- **Each storyline says its sound** in one line (`story.md` §2): the bed's feel and tempo, the one moment the music changes, which actions get effects, or silence and why.
- **Short pieces** (a title card, a sting under 10 s, captions or overlays on footage that has its own sound) follow the request and the footage.

## 2. The clock

- **Narrated**: the voice is the clock. 有真实词级时间时按词对齐, 否则使用实测片段时长做明确标注的分段同步.
- **Music only**: the music is the clock. Land the payoff and the mark on its strong beats (`npx hyperframes beats`, then `film.md` "On music"); cuts follow the motion, not the drums.
- Let the sound act out the story when it fits: the old way sits near silence, the music opens when the product appears; the music holds back until the payoff.

## 3. Music

用户已有配乐优先.  需要生成时调用平台 music_generate, 使用真实 schema, 完成后接入本地文件并实测时长.  工具不可用或失败时说明原因和可选方案, 不要求 HeyGen 登录或安装本地音乐模型, 不将无声结果冒充配乐完成.

## 4. Effects

Few and exact: every effect has a cause on screen, and too many read as a template.

| Sound             | Only on                                        |
| ----------------- | ---------------------------------------------- |
| click             | a real cursor click on screen                  |
| whoosh            | a scene cut, or a large card moving fast       |
| soft key tick     | text arriving letter by letter or line by line |
| pop               | a badge, chip or number landing                |
| riser into impact | the payoff or the mark, once in the film       |

- Place a clip so its peak lands one frame after its picture (light arrives before sound; a sound early feels wrong sooner than one late): FFmpeg/FFprobe 的本地音轨检查 reports where it hits, and most files peak after their start.
- Each hit sits 3-6 dB over the bed; a bed with most of its energy under 150 Hz plays as nothing on a phone speaker.
- Rotate two or three takes of a repeated sound; the same whoosh on every cut is the most common tell.
- Over strong music, a typing-heavy film can drop the clicks and keys. No synthesised tones, chimes or dings.

## 5. Levels

Music under a voice sits around 0.14 volume; nothing clips (AI audio often does). Keep each file's true peak at −1 dBTP or lower and the mix around −16 to −14 LUFS for social, `npx hyperframes normalize-audio` to match levels (`/media-use`). Check the rendered file with FFmpeg/FFprobe 的本地音轨检查: sound present, hits where the picture hits, loudness in range. Say in the delivery note that it was measured, not heard (`review.md` §4).
