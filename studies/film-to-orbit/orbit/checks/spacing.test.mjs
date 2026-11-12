import assert from 'node:assert/strict';
import {solveSpacing,approachOffset,MAX_SPACING} from '../spacing.js';
const limit={left:24,right:866,top:88,bottom:906};
const pair=[{left:180,right:760,top:310,bottom:490},{left:210,right:790,top:330,bottom:510}];
const close=solveSpacing(pair,0,limit);
assert(Math.hypot(close[1].x,close[1].y)<=MAX_SPACING,'Two overlapping ribbons must not fly apart');
assert.deepEqual(close[0],{x:0,y:0},'Focused track stays at its cursor anchor');
const pile=Array.from({length:6},(_,i)=>({left:180+i*10,right:760+i*10,top:310+i*2,bottom:490+i*2}));
let offsets=pile.map(()=>({x:0,y:0}));
for(let frame=0;frame<600;frame++) {
  const goals=solveSpacing(pile,0,limit);
  offsets=offsets.map((old,i)=>{
    const next=approachOffset(old,goals[i],1/60);
    assert(Math.hypot(next.x,next.y)<=MAX_SPACING+1e-8,'Dense labels stay close to their natural orbit');
    assert(Math.hypot(next.x-old.x,next.y-old.y)<=150/60+1e-8,'No instantaneous collision kicks');
    return next;
  });
}
const zero=solveSpacing(pile,-1,limit);
for(let frame=0;frame<120;frame++)offsets=offsets.map((old,i)=>approachOffset(old,zero[i],1/60));
assert(offsets.every(o=>Math.hypot(o.x,o.y)<.01),'Release returns all labels home; none remain stuck');
assert.deepEqual(solveSpacing(pair,0,limit),close,'History cannot accumulate correction');
console.log('PASS: pair and dense-cluster displacement caps, speed cap, pinned anchor, no accumulation, complete release.');
