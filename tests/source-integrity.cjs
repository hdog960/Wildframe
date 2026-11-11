// Wildframe push-time source safety checks. No external dependencies.
// This does NOT replace in-browser gameplay QA or artwork acceptance.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {spawnSync} = require('node:child_process');
const html = fs.readFileSync('index.html','utf8');
const bytes = Buffer.byteLength(html);
assert(bytes >= 3_500_000,
  'Wildframe single-file source shrank unexpectedly; check for partial/truncated writes. If intentionally modularized, update this guard with a verified asset manifest.');
assert(/<html\b/i.test(html) && /<\/html\s*>\s*$/i.test(html),
  'HTML document must be complete, including its closing element');
for(const anchor of ['Phaser','this.hero','this.wild']){
  assert(html.includes(anchor),'Critical game implementation marker missing: '+anchor);
}
assert(!/^(?:<<<<<<< |=======|>>>>>>> )/m.test(html),
  'Unresolved merge-conflict marker in playable HTML');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
let validated=0;
for(const [tag,attrs,body] of scripts){
  if(/\bsrc\s*=/.test(attrs)||!body.trim())continue;
  const type=attrs.match(/\btype\s*=\s*(['"])(.*?)\1/i)?.[2]?.trim().toLowerCase()||'text/javascript';
  if(!['text/javascript','application/javascript','module'].includes(type))continue;
  const args=type==='module'?['--input-type=module','--check']:['--check'];
  const check=spawnSync(process.execPath,args,{input:body,encoding:'utf8',maxBuffer:4_000_000});
  assert.equal(check.status,0,
    'Inline JavaScript #'+(validated+1)+' does not parse: '+(check.stderr||check.error||'unknown error'));
  validated++;
}
assert(validated>=1,'No inline JavaScript game entry point was checked');
// Startup/save regression contracts: fail CI if a source edit silently strips
// the playable scene, input-safe rendering, or existing persistence fallback.
// These are static smoke checks, not proof of successful browser boot.
const contracts = [
  ['Phaser scene bootstrap', /function createGame\(\)\s*\{\s*return new phaser_1\.default\.Game\(/],
  ['Game mounts into viewport', /parent:\s*'game'/],
  ['Pixel art renderer', /pixelArt:\s*true/],
  ['Hero physics sprite', /this\.hero\s*=\s*this\.physics\.add\.sprite\(/],
  ['Wild creature collection', /this\.wild\s*=\s*\[\]/],
  ['Existing save validator', /function validateSave\(/],
  ['Existing save function', /async function saveGame\(/],
  ['Fallback save storage', /localStorage\.setItem\(STORAGE_KEY/],
  ['Save backup retained', /backup:\s*previous\?\.state/],
];
for (const [label, pattern] of contracts) {
  assert(pattern.test(html), 'Critical Wildframe startup/save contract missing: '+label);
}

// Animation regression contracts: protect the existing authored frames and
// pause/resume behavior while genuine eight-direction artwork is developed.
// These static checks do not establish visual acceptance.
const motionContracts = [
  ['Pause holds actual hero stride pose', /const heldHeroFrame = this\.hero\.frame\?\.name;[\s\S]{0,180}this\.hero\.anims\.stop\(\)/],
  ['Hero pause stops animation', /this\.hero\.anims\.stop\(\);[\s\S]{0,700}creature\.sprite\.anims\.pause\(\)/],
  ['Hero paused pose uses painted atlas frame', /this\.hero\.setFrame\(pausedRow \* 3\)/],
  ['Creature animation resumes after pause', /w\.sprite\.anims\.isPaused\)[\s\S]{0,100}w\.sprite\.anims\.resume\(\)/],
  ['V3 atlas loaded', /scene\.load\.spritesheet\('v3-hero', 'assets\/v3\/hero-eightway\.png', \{ frameWidth: 80, frameHeight: 96 \}\)/],
  ['Puddlewink atlas loaded', /scene\.load\.spritesheet\('v3-puddlewink', 'assets\/v3\/puddlewink-eightway\.png', \{ frameWidth: 80, frameHeight: 96 \}\)/],
  ['Puddlewink 8-way animations', /create\(`v3-puddlewink-\$\{dir\}`, 'v3-puddlewink', row \* 3, row \* 3 \+ 2, 8\)/],
  ['Puddlewink and Thornroller V3 selection', /speciesId === 'mossmunch' \|\| speciesId === 'puddlewink' \|\| speciesId === 'thornroller'/],
  ['Thornroller atlas loaded', /scene\.load\.spritesheet\('v3-thornroller', 'assets\/v3\/thornroller-eightway\.png', \{ frameWidth: 80, frameHeight: 96 \}\)/],
  ['Thornroller eight-way animations', /create\(`v3-thornroller-\$\{dir\}`, 'v3-thornroller', row \* 3, row \* 3 \+ 2, 9\)/],
  ['Puddlewink V2 fallback', /hasV3Atlas \? v3Texture : 'v2-' \+ speciesId/],
  ['Eight real directional animations', /\['down', 'down-left', 'left', 'up-left', 'up', 'up-right', 'right', 'down-right'\]\.forEach/],
  ['Diagonal movement selects diagonal art', /this\.facing = \(my > 0 \? 'down-' : 'up-'\) \+ \(mx > 0 \? 'right' : 'left'\)/],
  ['Old v2 fallback preserved', /this\.hasV3Hero \? 'v3-hero' : 'v2-hero'/],
  ['Hero animation uses authored frames', /this\.hero\.play\(nextAnimation, true\)/],
  ['Hero painted proportions remain stable', /this\.hero\.setScale\(\.82\)/],
  ['Diagonal movement deadband', /ax > ay \* 1\.18[\s\S]{0,150}ay > ax \* 1\.18/],
];
for (const [label, pattern] of motionContracts) {
  assert(pattern.test(html), 'Wildframe animation contract missing: '+label);
}
assert(html.includes("assets/v3/naturalist-eightway.png"), 'Naturalist atlas load missing');
assert(html.includes("v3-npc-naturalist-\u0024{dir}"), 'Naturalist eight-way animation missing');
assert(html.includes("const route = ["), 'Naturalist field-study route missing');
for (const dir of ['down-right','up-right','up-left','down-left']) {
  assert(html.includes("facing: '"+dir+"'"), 'Naturalist missing authored circuit leg: '+dir);
}
assert(html.includes("npc.play('v3-npc-naturalist-' + stop.facing, true)"), 'Naturalist route animation missing');
assert(html.includes("npc.setDepth(npc.y)"), 'Naturalist painter depth tracking missing');
assert(html.includes("targets: npc,") && html.includes("footShadow.setPosition(npc.x, npc.y + 1)") && html.includes("t.setPosition(npc.x, npc.y - 84)"), 'Naturalist walking must preserve ground-shadow and floating nameplate offsets');
// Only the Naturalist's authored route must tween its sprite alone. Other
// residents still intentionally use the legacy three-target porch sway.
const naturalistRoute = html.slice(html.indexOf("const route = ["), html.indexOf("} else {\n                    this.tweens.add({ targets: [npc, t, footShadow]"));
assert(naturalistRoute.includes("targets: npc,"), 'Naturalist route must tween only its sprite');
assert(!naturalistRoute.includes("targets: [npc, t, footShadow]"), 'Naturalist route must not collapse visual anchors');
assert(html.includes("this.time.delayedCall(420, walkLeg)"), 'Naturalist field observation pause missing');
assert(html.includes("npc.play('v2-npc-' + id + '-move')"), 'Other resident fallback missing');
console.log('Wildframe integrity PASS: '+bytes+' bytes; '+validated+' inline JS blocks syntax-checked. Real browser/iPhone QA still required.');
