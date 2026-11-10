import { readFile, writeFile } from 'node:fs/promises'

// The full selected cell plate sits at y=0. Edge strips mirror at identical
// source rows to extend its material without a blend or a hard repeat seam.
const asset = new URL('../public/assets/', import.meta.url)
const plate = (await readFile(new URL('clean-0-d12f3cfbe8a2.webp', asset))).toString('base64')
const atlas = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1536" height="8192" viewBox="0 -4096 1536 8192">
<defs>
 <image id="wall" width="1536" height="1024" xlink:href="data:image/webp;base64,${plate}"/>
 <clipPath id="upper-a"><rect width="1536" height="200"/></clipPath>
 <clipPath id="upper-b"><rect y="200" width="1536" height="200"/></clipPath>
 <clipPath id="lower-a"><rect width="1536" height="224"/></clipPath>
 <clipPath id="lower-b"><rect y="224" width="1536" height="224"/></clipPath>
 <pattern id="upper" width="1536" height="400" patternUnits="userSpaceOnUse" viewBox="0 0 1536 400">
  <g clip-path="url(#upper-a)"><use xlink:href="#wall"/></g>
  <g clip-path="url(#upper-b)"><use xlink:href="#wall" transform="translate(0 400) scale(1 -1)"/></g>
 </pattern>
 <pattern id="lower" y="1024" width="1536" height="448" patternUnits="userSpaceOnUse" viewBox="0 0 1536 448">
  <g clip-path="url(#lower-a)"><use xlink:href="#wall" transform="translate(0 1024) scale(1 -1)"/></g>
  <g clip-path="url(#lower-b)"><use xlink:href="#wall" transform="translate(0 -576)"/></g>
 </pattern>
</defs>
<rect x="0" y="-4096" width="1536" height="4096" fill="url(#upper)"/>
<use xlink:href="#wall"/>
<rect x="0" y="1024" width="1536" height="3072" fill="url(#lower)"/>
</svg>`
await writeFile(new URL('concrete-continuous.svg', asset), atlas)
