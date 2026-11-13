import assert from 'node:assert/strict';
import {createTrace,createPaperClock,traceX,penFraction,inkDelay} from '../seismograph-trace.js';
const clock=createPaperClock();clock.step(100);clock.step(116);clock.step(150);
assert(Math.abs(clock.time-.05)<1e-10,'Paper follows elapsed time, not a frame counter');
clock.stop();clock.step(5000);assert.equal(clock.time,.05,'Pause/hidden time must not move paper');
clock.step(5025);assert(Math.abs(clock.time-.075)<1e-10);clock.reset();assert.equal(clock.time,0);
const samples=new Float32Array(1024);samples[20]=.25;samples[300]=-.75;samples[600]=.5;samples[900]=-.125;
const trace=createTrace(8);trace.capture(samples,1);
const points=[];trace.points(0,2,(t,v)=>points.push([t,v]));
assert.deepEqual(points.map(p=>p[1]),[.25,-.75,.5,-.125],'Keep signed measured transients');
assert.equal(trace.at(0),0,'No fabricated history before recording');
assert(Math.abs(trace.at((points[0][0]+points[1][0])/2)+.25)<1e-8,'Interpolate pen between actual measurements');
for(const width of [150,390,600]){
 const drawTime=1-inkDelay;
 assert.equal(traceX(drawTime,drawTime,width),width*penFraction,'Pen is fixed across both player sizes');
 const dx=traceX(.8,drawTime+.016,width)-traceX(.8,drawTime,width);
 assert(Math.abs(dx+width*penFraction*.016/4)<1e-8,'Ink moves a continuous elapsed-time distance between capture batches');
}
trace.capture(samples,2);trace.capture(samples,3);assert.equal(trace.count,8);
const retained=[];trace.points(-Infinity,Infinity,(t,v)=>retained.push(t));
assert(retained.every((t,i)=>!i||t>retained[i-1]),'Ring wrap preserves chronological order');
assert(retained[0]>1,'Old data is evicted with bounded memory');
trace.clear();assert.equal(trace.count,0);assert.equal(trace.at(99),0);
const silence=createTrace();silence.capture(new Float32Array(1024),1);silence.points(0,2,(t,v)=>assert.equal(v,0,'Silence stays flat'));
console.log('PASS: steady paper speed, pause/resume, genuine signed peaks, pen interpolation, responsive fixed point, bounded history, clear and silence.');
