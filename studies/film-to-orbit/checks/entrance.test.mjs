import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../orbit/scene.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function applyEntrance(){'),source.indexOf('\nif(embedded){',source.indexOf('function applyEntrance(){')));
const noop=()=>{};
const poses=new Map();
for(const arrival of [0,.25,.5,.599999,.6,.600001,.75,.999999,1]){
 let xyz=[],rotation=[];
 const context={THREE:{MathUtils:{smoothstep:(x,a,b)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);},lerp:(a,b,t)=>a+(b-a)*t}},entrance:{arrival,orbit:1,interactive:true},character:{scale:{set:(...v)=>xyz=v,setScalar:v=>xyz=[v,v,v]},position:{set:noop},rotation:{set:(...v)=>rotation=v}},constellation:{traverse:noop},debrisEnabled:true,debrisEntrance:null,debris:{stats:{loaded:true},group:{}},document:{body:{dataset:{},classList:{toggle:noop}}},materialState:new Map()};
 runInNewContext(fn+';applyEntrance();',context);
 poses.set(arrival,rotation);
 assert(xyz.every(v=>v===xyz[0]),`Character must retain proportions at arrival ${arrival}: ${xyz}`);
}
assert.deepEqual(poses.get(0),poses.get(.6),'Hold the film angle through the reveal');
for(const [a,b] of [[.599999,.600001],[.999999,1]])assert(poses.get(a).every((v,i)=>Math.abs(v-poses.get(b)[i])<.00001),'No rotation jump when the turn starts or idle resumes');
const rest=source.match(/character\.rotation\.set\(([^)]+)\)/)[1].split(',').map(Number);
assert.deepEqual(poses.get(1),rest,'Restore the approved resting orientation');
console.log('PASS: proportions preserved, reveal pose held, smooth rotation endpoints, original resting pose restored.');
