# Wildframe — GitHub-only development access and safety

## Why the default file reader fails
The live game is currently distributed as one generated, self-contained `index.html` of approximately 4.1 MB. GitHub's repository contents API returns an empty `content` field for large files (over 1 MB), even when a `start_line`/`end_line` or `base64` encoding is requested. An empty result from `fetch_file` is **not** an empty game. Do not rewrite or replace the page based on that result, and do not pause development solely for this condition.

## Verified non-destructive recovery (2026-11-08)
- GitHub repository: `hdog960/Wildframe`, branch `main`.
- Read `https://api.github.com/repos/hdog960/Wildframe/git/trees/main?recursive=1` through GitHub's `fetch` tool to get the current `index.html` blob SHA and file size.
- Use GitHub `fetch_blob({repository_full_name:"hdog960/Wildframe",blob_sha:<current blob SHA>})` to retrieve the **full UTF-8 HTML**, instead of `fetch_file`. A 4,092,203-character response was successfully retrieved for blob `281af61cb285c4a72129fbb7ffe0a8ec865141dd`.
- For a safe, non-deploying write-path test, `create_blob` with the unchanged 4,092,203-character content returned the same blob SHA. Thus the connected GitHub tools can both retrieve and store the complete file without a Git clone or an external paid tool.
- The blob SHA above is only an example; ALWAYS resolve and use the **current** head file SHA before editing.

## Required safe source editing procedure
1. Read the latest `main` commit and Git tree. Retrieve `index.html` by current `fetch_blob`. Read the current roadmap, other small documentation, and newest work; avoid stale snapshots and concurrent overwrites.
2. Inspect relevant sections of the full source with in-memory searches/slices; a 4 MB response should not be pasted into a user-facing chat. Make only precise, anchored, bounded changes to the real app source with matching assertions and preserve the complete rest of the HTML.
3. Verify new and old content, relevant source invariants, assets, load paths and save keys. Run actual tests/runtime verification if an execution environment permits; do not claim tests that did not run.
4. To write a full bundled HTML file, use GitHub `create_blob` with the **entire** updated UTF-8 content, then `create_tree` using the latest parent tree and a single `index.html` entry (`mode:"100644", type:"blob", path:"index.html", sha:<new blob sha>`). Use `create_commit` with the verified parent commit and new tree. Only move `main` with `update_ref` if the head remains the expected parent; refuse or rebase if it changed. Never force-overwrite other changes. Alternatively use `update_file` with the exact current blob SHA if it accepts the full payload.
5. Confirm the committed file's new blob SHA via Git tree, review the actual commit diff, verify deployment status if possible, and explicitly distinguish commits from GitHub Pages or physical iPhone testing.
6. Keep game changes separate from documentation-only work. Preserve the game's visual acceptance checkpoint and stop for creator review when truly ready.

## Existing architecture and design constraints
The 4.1 MB page includes substantial embedded art/animation/application code; the game is not blank. Preserve the working game, all save data and the original detailed roadmap. Focus on real art and animation polish, correct diagonal player/creature sprite motion, original cohesive environments, distinct houses and mobile rendering. Do not replace actual playable artwork with mockups or invented screenshot evidence.

## 2026-11-08 — Hero atlas fidelity / diagonal input stabilization
- Gameplay commit `aaa7ecffff9ca33f6ad8df8fde064f375d5b2faf` modified only `index.html` using complete 4,092,203-character source fetched via Git blob API; new blob `167476dd1ae631d697fa5c6f506b24673925a07b` (4,092,940 characters).
- Removed nonuniform scale pulsing that deformed the painted hero during walking. Preserved the 64x96 atlas, stable .82 scale and foot origin; added an 18% directional decision deadband to reduce diagonal cardinal-frame flicker; animation playback follows stick magnitude, and reduced-motion uses a static pose.
- Verified exact-anchor source edit, Git commit diff, main branch head and index blob SHA. No automated gameplay/browser tests or actual iPhone tests performed. GitHub Pages build was queued when checked; publication not yet verified.
- Visual checkpoint remains OPEN: these are motion fidelity fixes, NOT genuine 8-way painted hero sheets. Next: browser capture and visual assessment of hero animation, then original diagonal sprite artwork and creature animation continuity. No visual signoff.

## 2026-11-08 — Input-vector and hero gait consistency (hourly run)
- Gameplay commit `2ed78e40f936069c117830a4f26e27408b8d9fd0` changed only `index.html` (15 added, 8 removed lines), using the complete Git blob source, not the empty contents API response. New blob `d4ba2ebc8ca1d88d4224858250757e91ddf20e3a` was confirmed on main.
- Keyboard movement now takes precedence when direction keys are held instead of summing keyboard and joystick input; diagonal vectors are normalized once before both physics and animation speed, avoiding diagonal animation overspeed and erratic keyboard/touch combination. Existing four-direction art and deadband remain intact; no new diagonal painted frames were fabricated.
- Verified source anchors, full-file length guard, Git fast-forward commit, main branch SHA, file diff and blob SHA. No browser/runtime test or physical iPhone test was performed; GitHub Pages deployment status could not be confirmed through the available GitHub fetch endpoint.
- Visual acceptance remains OPEN. Next priority: real-browser capture, original eight-direction hero and creature sprite art, diagonal continuity and UI visual QA. Preserve saves and current mechanics.

## 2026-11-08 — Creature silhouette integrity and stable facing (hourly run)
- Gameplay commit `79c4e8ba2070530b4a4cb68e28fd723a95ecb923` changed only `index.html` using the full Git blob (old SHA `d4ba2ebc8ca1d88d4224858250757e91ddf20e3a`, new SHA `69e5bd761103d50298123cde0941667362137ed7`).
- Removed synthetic nonuniform creature squash/stretch and rocking that warped static imported creature art; preserved actual movement paths and uniform .78 painted sprite scale. Retained only subtle 2px hovering for hushwing (disabled with reduced motion). Horizontal flip now changes only on meaningful movement (>0.12px/frame), reducing direction jitter on near-stationary wandering.
- Verified exact source anchors, 4MB full-file length, Git fast-forward commit, actual one-file diff and main-branch blob SHA. Browser/runtime testing, physical iPhone testing, and GitHub Pages publication NOT verified.
- Artwork approval remains OPEN. These are visual-integrity fixes, not genuine eight-direction creature sprites. Next: inspect real running captures and build authentic directional creature/hero frames without artificial sprite deformation. Preserve existing saves, creature systems, and locked roadmap.

## 2026-11-08 — Creature grounding and contact-depth artwork (hourly run)
- Gameplay commit `09dcc4c47b7b58e6030498a76a4a4ba22f2bcd2a` changed only the complete `index.html` using Git blob API (new blob `c20b5a0c999cbe17ff2dee88ce9d74c3d3e04236`).
- Added subtle translucent ground-contact ellipses behind each wild and housed creature; shadows follow true ground coordinates while hushwing's existing small hover remains above them. Shadows track Y-depth for painterly spatial separation and clean up during capture/world transitions. Preserved existing painted silhouettes, proportional scales, movement, creature state and saves.
- Verified exact anchored replacements, full source size, successful fast-forward main update, new blob in Git tree and GitHub commit. Pages workflow 42564612460 was QUEUED at verification; successful publication, browser runtime and physical iPhone testing were not verified. Source-level assertions are not runtime tests.
- Visual acceptance remains OPEN; authentic eight-direction creature and hero artwork, real browser captures, visual QA and publication confirmation remain outstanding. Do not unlock subsequent roadmap phases.

## 2026-11-09 — Creature-specific ground-contact proportions
- Gameplay commit `f44c27825cb2309fb45ab8152266f7c3c6046e9c` changed only `index.html`; full source read from current blob and committed with safe fast-forward. New blob `eec997a277bf063b49daf859edaff4eec46b2481` verified on main.
- Tailored creature contact-shadow widths to individual species instead of one generic 33px oval; Hushwing's hovering shadow is narrower, thinner and lighter. Ground position and Y-depth tracking remain intact; no sprite texture or saved data changes. Removed redundant per-frame shadow-alpha assignment, retaining creation-time alpha.
- Verified anchored edits, full source length, Git diff, commit and branch tree. GitHub Pages workflow `42570793762` was queued when inspected; publication, browser visual quality and physical iPhone testing not yet verified.
- Visual gate OPEN: authentic eight-direction hero/creature sprite artwork and actual gameplay visual review remain necessary; do not advance next phase before creator approval.
