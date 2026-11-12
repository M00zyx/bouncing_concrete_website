// Measure the actual ink, not the font's em box: Anton extends above a top baseline.
export function titleCanvas(lines, fontSize=150) {
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.font=`${fontSize}px Anton`;
  context.textBaseline='alphabetic';
  const metrics=lines.map(line=>context.measureText(line));
  const ascent=Math.ceil(Math.max(...metrics.map(m=>m.actualBoundingBoxAscent)));
  const descent=Math.ceil(Math.max(0,...metrics.map(m=>m.actualBoundingBoxDescent)));
  const pad=32, gap=24, advance=ascent+descent+gap;
  canvas.width=Math.ceil(Math.max(...metrics.map(m=>m.actualBoundingBoxLeft+m.actualBoundingBoxRight)))+pad*2;
  canvas.height=pad*2+ascent+descent+(lines.length-1)*advance;
  context.font=`${fontSize}px Anton`;context.textBaseline='alphabetic';context.fillStyle='#fff';
  lines.forEach((line,i)=>context.fillText(line,pad+metrics[i].actualBoundingBoxLeft,pad+ascent+i*advance));
  return {canvas,context};
}
