import assert from 'node:assert/strict';
import {createPlayback} from '../playback.js';
class Audio extends EventTarget{currentTime=0;duration=253;ended=false;paused=true;loads=0;src='';load(){this.loads++;this.dispatchEvent(new Event('loadedmetadata'));}async play(){this.paused=false;this.dispatchEvent(new Event('playing'));}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}}
let contexts=0,sources=0;
globalThis.window={AudioContext:class{constructor(){contexts++;}createAnalyser(){return {connect(){}}}createMediaElementSource(){sources++;return {connect(){}}}resume(){return Promise.resolve()}}};
const audio=new Audio(),p=createPlayback({audio,cloudFrame:{}}),track={slug:'funkacaine',title:'Funkacaine',audio:'audio.mp3',duration:253};
p.select(track);await Promise.resolve();assert.equal(p.state.status,'playing');assert.equal(audio.loads,1);p.seek(101);assert.equal(audio.currentTime,101);p.select(track);assert.equal(audio.currentTime,101,'Selecting the current playing release must not restart it');assert.equal(audio.loads,1);
p.pause();assert.equal(p.state.status,'paused');await p.play();assert.equal(audio.currentTime,101,'Pause/resume preserves position');assert.equal(contexts,1);assert.equal(sources,1,'All views share one media source');
p.seek(999);assert.equal(audio.currentTime,253);p.seek(-1);assert.equal(audio.currentTime,0);
audio.ended=true;audio.dispatchEvent(new Event('ended'));assert.equal(p.state.status,'ended');await p.play();assert.equal(audio.currentTime,0);
console.log('PASS: one audio source, same-track continuity, pause/resume, bounded seeking and replay.');
audio.ended=false;audio.dispatchEvent(new Event('error'));assert.equal(p.state.status,'error');const loadsBeforeRetry=audio.loads;p.retry();await Promise.resolve();assert.equal(audio.loads,loadsBeforeRetry+1,'Retry reloads the failed source');assert.equal(p.state.status,'playing');assert.equal(sources,1,'Retry reuses the one audio graph');console.log('PASS: failed playback retries by reloading, without duplicate media sources.');
const sample={slug:'pressure-test',title:'Pressure Test',sample:true};
const beforeSample=audio.loads;p.select(sample);
assert.equal(p.state.mode,'sample');assert.equal(p.state.status,'unavailable');assert.equal(audio.paused,true);assert.equal(p.state.position,0);assert.equal(p.state.duration,0);
await p.play();p.toggle();assert.equal(audio.loads,beforeSample);assert.equal(audio.paused,true,'Samples never play the previous release');assert.equal(p.state.status,'unavailable');
p.select(track);await Promise.resolve();assert.equal(p.state.status,'playing');assert.equal(sources,1);
console.log('PASS: samples stop prior audio, stay unavailable, and return to the shared native source.');
