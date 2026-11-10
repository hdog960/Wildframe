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
console.log('Wildframe integrity PASS: '+bytes+' bytes; '+validated+' inline JS blocks syntax-checked. Real browser/iPhone QA still required.');
