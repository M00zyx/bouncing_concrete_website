// Timestamped, bounded history. Rendering never invents oscillation or beats.
export function createTrace(capacity=512){
 const times=new Float64Array(capacity),values=new Float32Array(capacity);
 let head=0,count=0;
 const index=i=>(head-count+i+capacity)%capacity;
 return {
  clear(){head=0;count=0;},
  get count(){return count;},
  get start(){return count?times[index(0)]:Infinity;},
  capture(samples,time,span=1/30){
   const blockSize=Math.floor(samples.length/4);
   for(let block=0;block<4;block++){
    let peak=0;
    for(let i=block*blockSize;i<(block+1)*blockSize;i++)if(Math.abs(samples[i])>Math.abs(peak))peak=samples[i];
    times[head]=time-span*(3-block)/4;values[head]=peak;
    head=(head+1)%capacity;count=Math.min(count+1,capacity);
   }
  },
  points(from,to,visit){for(let i=0;i<count;i++){const j=index(i);if(times[j]>=from&&times[j]<=to)visit(times[j],values[j]);}},
  at(time){
   if(!count)return 0;
   let previous=index(0);if(time<times[previous])return 0;
   for(let i=1;i<count;i++){
    const j=index(i);
    if(times[j]>=time){const t=(time-times[previous])/Math.max(1e-9,times[j]-times[previous]);return values[previous]+(values[j]-values[previous])*t;}
    previous=j;
   }
   return values[previous];
  }
 };
}
export function createPaperClock(){
 let time=0,last=null;
 return {get time(){return time;},step(now){if(last!==null)time+=Math.max(0,now-last)/1000;last=now;return time;},stop(){last=null;},reset(){time=0;last=null;}};
}
export const paperWindow=4;
export const inkDelay=1/30;
export const penFraction=.94;
export const traceX=(sampleTime,drawTime,width)=>width*penFraction-(drawTime-sampleTime)*width*penFraction/paperWindow;
