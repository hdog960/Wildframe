# Wildframe Alpha 0.1.1 iPhone web preview

This GitHub Pages deployment is a self-contained single-file export of the actual playable Wildframe Alpha 0.1.1 Phaser game. Its runtime, PNG artwork, and code are embedded directly into `index.html` for simple, no-cost static hosting. It is not a concept-art mockup. The original full source and complete roadmap remain in the separately delivered full-source ZIP.

Visit https://hdog960.github.io/Wildframe/ on iPhone Safari. The game has responsive and touch-capable input but has not yet been verified on physical iPhone hardware. Offline/PWA service-worker operation is not enabled in this single-file deployment.

Save files use IndexedDB/localStorage per browser origin; progress stored on localhost will not automatically appear on github.io. Export a save before migrating, and use the in-game save import if needed. Updates should preserve the save schema.

This deployment path is temporary pending a normal multi-file production publish of the complete `dist/` folder.
