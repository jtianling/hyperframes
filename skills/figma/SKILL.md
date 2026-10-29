---
name: figma
description: Bring Figma into a HyperFrames video - rendered assets, brand tokens, components, storyboard frames as reconstructed motion (frames read as states, not slides), shaders and connector-assisted motion. Use when the person pastes a figma.com link or asks to use a Figma design, frame, logo or brand.
---

先读 [monkeys 平台接入](references/platform.md), 使用本 skill 的 platform-cli.mjs 和平台媒体工具.  本文优先于原版安装, 云服务和交付流程.

# Figma → HyperFrames

素材在制作阶段接入为本地文件, 渲染阶段不请求 Figma.  优先使用平台实际提供且已授权的 Figma connector, 以当轮 schema 为准.  没有 connector 时使用用户导出的 SVG, PNG 或设计资料, 明确无法读取仅有链接的私有设计.

## 接入方式

不读取 FIGMA_TOKEN 或 .env, 不要求终端用户创建 token, 不运行 hyperframes figma 的 REST 直连命令.  从 connector 的真实结果接入本地文件, 或使用用户导出文件, 保留来源和设计尺寸.  不因环境缺 connector 就重画品牌标志后冒充原始设计.

颜色, 字体和组件只有取得真实设计信息后才应用, 动效可按用户要求重建, 区分设计事实与自行创作.  下列 motion 和 shader 方法仅在实际 connector 提供对应数据时使用, 不猜接口或运行本机插件.

## Motion (connector)

Usage beacon: these phases have no CLI touchpoint, so run `npx hyperframes events --skill=figma-motion` when you begin and `npx hyperframes events --skill=figma-motion --event=skill_completed --outcome=success|error` when done. Same for shaders (`figma-shaders`) and storyboards (`figma-storyboard`).

1. Fetch motion context for the parent frame in one recursive request; cache the raw JSON in `.media/figma-cache/`.
2. Normalise with `motionContextToDocs(raw, { selectorFor, repeat })` from `@hyperframes/core/figma`, never by transcribing keyframes. It reads the motion.dev snippets (the CSS snippets stretch durations), drops loop-wrap tail keyframes and keeps bezier eases. `selectorFor` returns the ids from the component import.
3. `motionToGsap(doc)` → `emitTimelineScript(spec)`, injected after the GSAP and CustomEase tags: paused, finite, a literal `window.__timelines` key. Named eases outside the mapped set fall back to linear; say so.
4. Verify against Figma's own export: `node <SKILL_DIR>/scripts/verify-motion.mjs --reference <export.mp4> --render <render.mp4> --crop WxH+X+Y`. It compares motion between samples, so static drift cancels out, and fails under 15 dB (faithful ≈ 20+, diverging ≈ 5). Measure `--crop` from the render's card edges. A fail means fix the translation, not the threshold.
5. A track that won't translate: export it, freeze the MP4 and place it as `<video class="clip">`.

## Shaders

Figma's export path flattens shaders to their base colour, and shader source is only reachable for library-published styles. Ask the person for a native export of that frame (PNG or MP4) and place it as an asset or clip.

## Storyboards: frames are KEYFRAMES, not slides

Two frames holding the same element describe that element's state through time: animate the element between the states. Playing the frames back to back as stills is the failure mode.

1. Scenes are every frame-sized node in the section, named frames and loose full-frame rectangles alike: filter by size, not type or name. Order by `absoluteBoundingBox.x`.
2. Match children across neighbouring frames by name first, then by similar size and position. Tween geometry between states; crossfade two exports in place when the pixels changed. Export one asset per element, not one still per frame. Unmatched children enter or exit at their scene's beat.
3. Text nodes below the strip are motion notes for the scene above them, not on-screen copy. A note about motion inside a scene ("lines reveal one after another") means import that frame as a component and animate it.
4. Export in batches of about 4 scene frames per call: past about 12 ids `/v1/images` times out.
5. Frames that are one product UI in successive states: rebuild the UI as live DOM: code what changes state, freeze what doesn't, and treat each frame change as an interaction to perform (the cursor moves, clicks, the screen responds), not a tween to apply.
6. Stills are the fallback, only for frames with no shared elements.

Never leave a Figma URL in the composition.
