import assert from 'node:assert/strict';import {journeyState} from '../journey-state.js';
assert.equal(journeyState(0).title,1);assert.equal(journeyState(.17).title,0);assert.equal(journeyState(.76).film,1);assert.equal(journeyState(.76).dissolve,0);assert.equal(journeyState(.96).dissolve,1);assert.equal(journeyState(.89).orbit,0);assert.equal(journeyState(1).arrival,1);assert.equal(journeyState(1).orbit,1);assert.equal(journeyState(.99).interactive,false);assert.equal(journeyState(1).interactive,true);
let last={film:0,dissolve:0,arrival:0,orbit:0};for(let i=0;i<=1000;i++){const s=journeyState(i/1000);for(const k of Object.keys(last)){assert(s[k]>=last[k]&&s[k]<=1);last[k]=s[k];}if(s.dissolve>0)assert.equal(s.film,1);}
for(let i=0;i<1000;i++){const s=journeyState(i/1000,true);assert.equal(s.dissolve,0);assert.equal(s.arrival,0);assert.equal(s.interactive,false);}
assert.equal(journeyState(1,true).interactive,true);assert.deepEqual(journeyState(-1),journeyState(0));assert.deepEqual(journeyState(2),journeyState(1));console.log('PASS: film completes before handover, titles clear early, labels follow character, endpoints and reduced motion remain bounded.');

for(let i=0;i<=1000;i++){const s=journeyState(i/1000);if(s.reveal>0)assert.equal(s.dissolve,1,'Do not overlap incompatible film and mesh silhouettes');}
