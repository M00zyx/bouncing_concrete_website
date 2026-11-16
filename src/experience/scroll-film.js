const frameWidth = 640;
const frameHeight = 360;
const framesPerSheet = 12;
const lastFrame = 120;

export function createScrollFilm(canvas, onChange) {
 const context = canvas.getContext('2d');
 const sheets = new Map();
 let desiredSheet = 0;
 let drawnFrame = -1;
 let failed = false;

 function loadSheet(index) {
  if (sheets.has(index)) return sheets.get(index);
  const image = new Image();
  sheets.set(index, image);
  image.onload = () => { if (index === desiredSheet) onChange(); };
  image.onerror = () => {
   if (index === desiredSheet) {
    failed = true;
    onChange();
   }
  };
  image.src = new URL('./assets/scroll-frames/' + String(index).padStart(2, '0') + '.webp', import.meta.url);
  return image;
 }

 return {
  get failed() { return failed; },
  draw(progress) {
   if (!context) { failed = true; return -1; }
   const frame = Math.round(progress * lastFrame);
   desiredSheet = Math.floor(frame / framesPerSheet);
   for (const index of sheets.keys()) {
    if (Math.abs(index - desiredSheet) > 1) sheets.delete(index);
   }
   const image = loadSheet(desiredSheet);
   if (image.complete && image.naturalWidth === 0) failed = true;
   if (!image.naturalWidth) return drawnFrame;
   if (frame !== drawnFrame) {
    const cell = frame % framesPerSheet;
    context.drawImage(image, cell % 4 * frameWidth, Math.floor(cell / 4) * frameHeight,
     frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    drawnFrame = frame;
   }
   if (desiredSheet < Math.floor(lastFrame / framesPerSheet)) loadSheet(desiredSheet + 1);
   return drawnFrame;
  }
 };
}
