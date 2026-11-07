# Wildframe Alpha 0.1.2 — Mobile visual integration

This repository serves a self-contained Phaser preview from `index.html` on GitHub Pages.

## Changes from Alpha 0.1.1
- Resolved missing title/HTML/CSS artwork paths to the already embedded PNG data, including images created dynamically by interface redraws.
- Reconstructed the formerly missing Haven overview from the twelve bundled terrain tiles for the title background, minimap and map panel.
- Added iPhone viewport fit, dynamic viewport sizing, Home Screen presentation metadata, and portrait safe-area controls for the notch and home indicator.
- Unregistered scene resize listeners on shutdown to avoid duplicate callbacks after repeated scene transitions.
- Kept the existing bundled gameplay, sprites, items, save schema, import/export, and simulation code.

## Verification scope
Static source invariants checked against the release blob. **No actual iPhone or Safari execution is claimed for 0.1.2.** The prior Alpha 0.1.1 tests do not count as new release tests.

## Manual iPhone acceptance
1. Open https://hdog960.github.io/Wildframe/ in Safari. Hard-refresh after the update, if needed.
2. Confirm that Haven title/background, cabin and creature pictures render without missing-image icons.
3. New/Continue: move in all directions with the left thumbstick; check Interact, Scan, Dodge, Stun, and Mode with the right buttons.
4. Open and scroll Inventory and Settings; verify menus do not trap the screen or move the hero.
5. Rotate between portrait/landscape, then test after scrolling Safari's address bar; verify no clipped controls around the notch/home indicator.
6. Play long enough to earn progress. Background Safari and reopen it. Confirm Continue uses the same day/inventory.
7. Export a JSON save **before** trying an import or starting a new game.
8. If any item fails, capture the screen and describe iPhone model, iOS version, and the interaction.

## Known limits
- Not tested on a physical iPhone in this release session.
- Real-origin save persistence and prolonged GPU performance still require testing.
- Add to Home Screen is supported through Safari, but offline play is not guaranteed.
- This Pages repository contains the deployed HTML preview, not the complete original editable source/roadmap package.
