import shell from './experience/shell.html?raw';

// Keep the approved DOM and native ESM/WebGL runtime intact. Build/dev syncs
// src/experience into public/experience; this is the only canonical app source.
document.getElementById('root').outerHTML = shell;
const runtime = new URL('/experience/journey.js', window.location.origin);
import(/* @vite-ignore */ runtime.href).catch(() => {
  const error=document.querySelector('.scene-error');
  error.hidden=false;
  error.querySelector('p').textContent='The experience could not load. Reload to try again.';
  document.querySelector('#retry').onclick=()=>location.reload();
});
