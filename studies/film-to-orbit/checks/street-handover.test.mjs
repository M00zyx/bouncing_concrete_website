import assert from 'node:assert/strict';
import {streetOpacity,streetExposure} from '../street-handover.js';
import {journeyState} from '../journey-state.js';
for(const p of [.78,.815,.85,.87])assert.equal(streetOpacity(journeyState(p).arrival),1,'Street survives film dissolve and early pullback');
assert.equal(streetOpacity(.64),0,'Street clears before record entry');
assert.equal(streetExposure(0),.035,'Dark live silhouette avoids duplicate face details');
assert.equal(streetExposure(1),1.2,'Original orbit lighting restored');
let opacity=1,exposure=0;
for(let i=0;i<=1000;i++){
 const t=i/1000,a=streetOpacity(t),e=streetExposure(t);
 assert(a>=0&&a<=opacity);assert(e>=exposure&&e<=1.2);
 opacity=a;exposure=e;
}
// Pure progress mapping is reversible, independent of playback or scroll velocity.
const forward=Array.from({length:101},(_,i)=>[streetOpacity(i/100),streetExposure(i/100)]);
for(let i=100;i>=0;i--)assert.deepEqual([streetOpacity(i/100),streetExposure(i/100)],forward[i]);
console.log('PASS: plate hold, bounded fade/lighting, clear before tracks, exact reverse traversal.');
