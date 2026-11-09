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
