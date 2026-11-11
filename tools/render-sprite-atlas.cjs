#!/usr/bin/env node
'use strict';
// Convert an authored, source-controlled transparent SVG sprite atlas into PNG.
// Run in GitHub Actions (Playwright Chromium); never requires a user image upload.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function rasterize(svg, width, height) {
  assert(svg.includes('<svg'), 'Missing SVG root');
  assert(!/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),
    'No executable or external resources allowed in artwork source');
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  try {
    const page = await browser.newPage({viewport:{width,height}, deviceScaleFactor:1});
    const output = await page.evaluate(async ({svg,width,height}) => {
      const url = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
      try {
        const image = new Image();
        image.src = url;
        await new Promise((resolve,reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('SVG image failed to load'));
        });
        if (image.naturalWidth !== width || image.naturalHeight !== height) {
          throw new Error('SVG dimensions must equal '+width+'x'+height);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const context = canvas.getContext('2d',{willReadFrequently:true});
        context.clearRect(0,0,width,height);
        context.drawImage(image,0,0);
        const data = context.getImageData(0,0,width,height).data;
        let painted = 0, transparent = 0;
        const framePaint = new Array(width===240 && height===768 ? 24 : 0).fill(0);
        for (let y=0;y<height;y++) {
          for (let x=0;x<width;x++) {
            const a = data[(y*width+x)*4+3];
            if (a===0) transparent++;
            if (a>24) {
              painted++;
              if (framePaint.length) framePaint[Math.floor(y/96)*3+Math.floor(x/80)]++;
            }
          }
        }
        if (!painted || !transparent) throw new Error('Atlas needs visible artwork AND transparent pixels');
        if (framePaint.some(n => n<20)) throw new Error('At least one of 24 directional frames is empty');
        return {png:canvas.toDataURL('image/png').split(',')[1],painted,transparent};
      } finally {
        URL.revokeObjectURL(url);
      }
    }, {svg,width,height});
    const png=Buffer.from(output.png,'base64');
    assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'Invalid PNG signature');
    assert.equal(png.readUInt32BE(16),width,'PNG width mismatch');
    assert.equal(png.readUInt32BE(20),height,'PNG height mismatch');
    return {png,painted:output.painted,transparent:output.transparent};
  } finally {
    await browser.close();
  }
}

async function main() {
  if (process.argv[2]==='--self-test') {
    const test='<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect x="1" y="1" width="2" height="2" fill="#ff0000"/></svg>';
    const r=await rasterize(test,4,4);
    assert.equal(r.painted,4);
    assert.equal(r.transparent,12);
    console.log('Sprite transport self-test PASS: Chromium rendered a transparent PNG in memory');
    return;
  }
  const [input,output]=process.argv.slice(2);
  assert(input && output,'Usage: node tools/render-sprite-atlas.cjs <atlas.svg> <atlas.png>');
  const src=fs.readFileSync(input,'utf8');
  const result=await rasterize(src,240,768);
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,result.png);
  console.log('Verified 240x768 PNG with all 24 painted 80x96 frames: '+output+
    ' ('+result.png.length+' bytes; '+result.transparent+' transparent pixels)');
}
main().catch(e => {console.error(e);process.exitCode=1;});
