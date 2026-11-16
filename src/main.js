import shell from './experience/shell.html?raw';
import { setupSignupStudy } from './signup-study.js';
import './signup-study.css';

// Keep the approved DOM and native ESM/WebGL runtime intact. Build/dev syncs
// src/experience into public/experience; this is the only canonical app source.
document.getElementById('root').outerHTML = shell;
setupSignupStudy();
const runtime = new URL('/experience/journey.js?v=character-facing-2', window.location.origin);
import(/* @vite-ignore */ runtime.href).catch(() => {
  const error=document.querySelector('.scene-error');
  error.hidden=false;
  error.querySelector('p').textContent='The experience could not load. Reload to try again.';
  document.querySelector('#retry').onclick=()=>location.reload();
});

// Load Kit only after the form is mounted; plain POST remains a fallback.
const kitScript = document.createElement('script');
kitScript.src = 'https://f.convertkit.com/ckjs/ck.5.js';
kitScript.async = true;
document.body.append(kitScript);
