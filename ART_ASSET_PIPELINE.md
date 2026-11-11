# Wildframe — hands-off sprite delivery (2026-11-10)

The player must **never** need to download a generated image from ChatGPT and re-upload it to GitHub. A ChatGPT-generated image from a DIFFERENT conversation might not be available as a file in the current run; an image's old conversation file ID is not a portable disk path. Do not block development or request a manual upload for that reason.

## Supported source-first path (no binary tool transfer needed)
1. In the SAME development run, author an **original** transparent eight-way hero atlas as UTF-8 SVG source at `assets/v3/hero-eightway.svg` using connected GitHub write tools. It must be exactly **240×768**, with 24 distinct painted sprites on a **3-column × 8-row** grid of **80×96** each. Facing rows: down, down-left, left, up-left, up, up-right, right, down-right. Three authentic coherent stride poses per row. Preserve consistent body proportions, outfits, accessories, and foot anchor. Do not substitute rotated/mirrored sprites or primitive placeholders for genuine polished art.
2. The free `.github/workflows/wildframe-art.yml` workflow installs Chromium, executes a PNG transparency/frame-occupancy self-test, rasterizes the SVG using `tools/render-sprite-atlas.cjs`, validates its dimensions and 24 frame coverage, and commits `assets/v3/hero-eightway.png` back to main. This avoids a ChatGPT-to-GitHub binary-file handoff completely.
3. Check the actual Actions run and new PNG in GitHub; do NOT claim completion while the workflow is pending, fails, or cannot push. If GitHub Actions lacks write permissions, the development agent can also construct the same binary in its own tool session and use GitHub `create_blob(encoding:"base64")` plus `create_tree`, `create_commit`, `update_ref` to commit it without user uploading.
4. Only **after** GitHub contains the verified new PNG, integrate it into the real game's Phaser textures, eight directional animation keys, and diagonal movement selection while keeping v2 fallback. Test source integrity, Chromium gameplay, GitHub Pages publication, and visual continuity; preserve saves and creator's visual-approval gate.

To run in an environment with Playwright installed:
`node tools/render-sprite-atlas.cjs --self-test`
`node tools/render-sprite-atlas.cjs assets/v3/hero-eightway.svg assets/v3/hero-eightway.png`

An earlier 240×768 image candidate called `wildframe_hero_256.png` existed in a different ChatGPT session. It is *not* available by filename alone; if accessible in the active development conversation, inspect and use it. Otherwise AUTHOR new source-contained real artwork instead of sending the owner on a file-upload errand. Do not label unauthored artwork as deployed. Do not lower aesthetic standards to resolve transport.
