// Browser-only interaction check. Loaded solely with ?motion-check=1.
export function install({host,tracks,pointFor,state,overlapFixture,overlapProbe,visiblePoint,layoutMetrics}) {
  const panel=document.createElement('aside');
  panel.style.cssText='position:fixed;z-index:30;top:80px;left:24px;background:#fff;padding:12px;max-width:480px;font:12px monospace;box-shadow:0 3px 15px #0002';
  const status=document.createElement('p');
  const result=document.createElement('p');
  const sequence=document.createElement('p');
  let lastResult='';
  const cursor=document.createElement('i');
  cursor.style.cssText='position:fixed;z-index:29;width:14px;height:14px;border:2px solid #f23;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%)';
  let x=innerWidth*.5,y=innerHeight*.75,running=false,positioned=false;
  function move(nx,ny){cursor.hidden=false;x=nx;y=ny;cursor.style.left=x+'px';cursor.style.top=y+'px';host.dispatchEvent(new PointerEvent('pointermove',{clientX:x,clientY:y,pointerType:'mouse',bubbles:true}));}
  async function approach(track) {
    if(running)return;running=true;
    const end=pointFor(track);
    if(!positioned){host.dispatchEvent(new PointerEvent('pointerleave'));move(Math.max(40,end.x-150),Math.min(innerHeight-90,end.y+70));positioned=true;}
    const sx=x,sy=y;let acquired=new Set();let minGap=Infinity;let maxTurn=0;let initialGap=null;let peakAttachment=0;
    const started=performance.now();
    let t=0;
    while(t<1){
      await new Promise(requestAnimationFrame);
      t=Math.min(1,(performance.now()-started)/650);move(sx+(end.x-28-sx)*t,sy+(end.y-sy)*t);

      const check=state();peakAttachment=Math.max(peakAttachment,check.attachmentError||0,check.localPoseError||0);if(check.target!=='none')acquired.add(check.target);if(typeof check.gap==='number'){initialGap??=check.gap;minGap=Math.min(minGap,check.gap);}maxTurn=Math.max(maxTurn,check.turn);
    }
    const settleStarted=performance.now();
    while(performance.now()-settleStarted<8000) {
      await new Promise(requestAnimationFrame);
      const s=state();
      peakAttachment=Math.max(peakAttachment,s.attachmentError||0,s.localPoseError||0);
      if(s.docked)break;
    }
    const settled=state();
    result.textContent=`Last approach: ${track.title}. Acquired: ${[...acquired].join(', ')}. Start gap: ${initialGap}px; settled gap: ${settled.gap}px (X ${settled.gapX}, Y ${settled.gapY}). Mode: ${settled.mode}; docked: ${settled.docked}; click target: ${settled.clickTarget}; sphere attachment: ${peakAttachment.toExponential(1)} (${peakAttachment<1e-6?"PASS":"FAIL"}). Max turn: ${maxTurn}°. Approach and settle ${Math.round(performance.now()-started)}ms. Idle checked after pointer stops.`;
    lastResult=`${track.title}: ${[...acquired].join(' → ')}; end gap ${settled.gap}px (${settled.mode})`;
    running=false;
  }
  for(const track of [...tracks.slice(0,3),...tracks.slice(6)]){
    const button=document.createElement('button');button.textContent='Approach '+track.title;
    button.onclick=()=>approach(track);panel.append(button);
  }
  const pair=document.createElement('button');pair.textContent='Explore two releases';pair.onclick=async()=>{positioned=false;document.querySelector('#reset').click();await new Promise(requestAnimationFrame);await approach(tracks[0]);const first=lastResult;await approach(tracks[1]);sequence.textContent='Continuous sequence: '+first+' / '+lastResult;};panel.append(pair);
  const stable=document.createElement('button');stable.textContent='Check hold and release';stable.onclick=async()=>{
    if(running)return;
    document.querySelector('#reset').click();positioned=false;
    await new Promise(requestAnimationFrame);await approach(tracks[0]);
    running=true;let maxGap=0,maxAttachment=0,wrongClick=false;
    const started=performance.now();
    while(performance.now()-started<1200) {
      await new Promise(requestAnimationFrame);const s=state();
      maxGap=Math.max(maxGap,typeof s.gap==='number'?s.gap:Infinity);
      maxAttachment=Math.max(maxAttachment,s.attachmentError||0,s.localPoseError||0);
      if(s.clickTarget!==tracks[0].title)wrongClick=true;
    }
    host.dispatchEvent(new PointerEvent('pointerleave'));cursor.hidden=true;
    await new Promise(r=>setTimeout(r,1800));const released=state();
    const pass=maxGap<38&&maxAttachment<1e-6&&!wrongClick&&released.mode==='IDLE';
    sequence.textContent=`Hold/release ${pass?'PASS':'FAIL'}: max gap ${Math.round(maxGap)}px, attachment ${maxAttachment.toExponential(1)}, correct click ${!wrongClick}, release ${released.mode}.`;
    running=false;
  };panel.append(stable);
  for(const track of [tracks[2],tracks[1]]) {
    const sticky=document.createElement('button');sticky.textContent='Check sticky '+track.title;
    sticky.onclick=async()=>{
      if(running)return;
      document.querySelector('#reset').click();positioned=false;
      await new Promise(requestAnimationFrame);await approach(track);running=true;
      const origin={x,y},errors=[],moves=[];
      if(state().target!==track.title)errors.push('initial acquisition');
      for(const [dx,dy] of [[0,80],[-70,80],[-70,0],[0,0]]) {
        const sx=x,sy=y,from=pointFor(track),started=performance.now();let t=0;
        while(t<1) {
          await new Promise(requestAnimationFrame);t=Math.min(1,(performance.now()-started)/450);
          move(sx+(origin.x+dx-sx)*t,sy+(origin.y+dy-sy)*t);
          if(state().target!==track.title)errors.push('focus stolen by '+state().target);
        }
        const settle=performance.now();
        while(performance.now()-settle<900) {await new Promise(requestAnimationFrame);if(state().target!==track.title)errors.push('focus lost while settling');}
        const to=pointFor(track);moves.push(Math.round(Math.hypot(to.x-from.x,to.y-from.y)));
        if(moves.at(-1)<12)errors.push('label did not follow');
        if(state().attachmentError>1e-6 || state().localPoseError>1e-6)errors.push('detached');
      }
      const end=state();
      if(end.clickTarget!==track.title)errors.push('wrong click target');
      // Move beyond the fixed capture range, rather than just away from a
      // moving label: slow pointer motion must also be able to release it.
      const sx=x,sy=y,started=performance.now();
      while(performance.now()-started<550) {
        await new Promise(requestAnimationFrame);const t=Math.min(1,(performance.now()-started)/500);
        move(sx-270*t,sy);
      }
      if(state().target===track.title)errors.push('failed to release');
      host.dispatchEvent(new PointerEvent('pointerleave'));cursor.hidden=true;
      sequence.textContent='Sticky '+track.title+' '+(errors.length?'FAIL':'PASS')+': '+(errors.length?[...new Set(errors)].join(', '):'owner retained, follows in four directions, bounded release')+'. Following distances '+moves.join('/')+'px. Final click '+end.clickTarget+'.';
      running=false;
    };panel.append(sticky);
  }
  const guide=document.createElement('button');guide.textContent='Guide focused title down';guide.onclick=async()=>{
    if(running || state().target==='none')return;running=true;
    const owner=state().target,sx=x,sy=y,started=performance.now();let changed=false,t=0;
    while(t<1){await new Promise(requestAnimationFrame);t=Math.min(1,(performance.now()-started)/650);move(sx,sy+80*t);changed ||= state().target!==owner;}
    sequence.textContent='Guide down '+(changed?'FAIL':'PASS')+': '+owner+' retained.';running=false;
  };panel.append(guide);
  const spacing=document.createElement('button');spacing.textContent='Check spherical spacing';spacing.onclick=async()=>{
    if(running)return;running=true;document.querySelector('#reset').click();
    await new Promise(requestAnimationFrame);const point=overlapFixture();x=point.x;y=point.y;positioned=true;
    const before=state(),ownerStart=before.spacing.offsets.find(o=>o.title==='Concreto Incarnat');
    let maxAttachment=0,maxOwnerMove=0,maxOffset=0;
    const started=performance.now();
    while(performance.now()-started<3600){
      await new Promise(requestAnimationFrame);const s=state(),o=s.spacing.offsets.find(o=>o.title==='Concreto Incarnat');
      maxOwnerMove=Math.max(maxOwnerMove,Math.hypot(o.x-ownerStart.x,o.y-ownerStart.y));
      maxAttachment=Math.max(maxAttachment,s.attachmentError,s.localPoseError);
      maxOffset=Math.max(maxOffset,...s.spacing.offsets.map(o=>Math.abs(o.y)));
    }
    const after=state();const pass=after.spacingOverlap<before.spacingOverlap*.75&&maxOwnerMove<1e-6&&maxAttachment<1e-6&&maxOffset<=.260001&&after.opacity.every(v=>v===1);
    sequence.textContent='Sphere spacing '+(pass?'PASS':'FAIL')+': crowding '+before.spacingOverlap.toFixed(3)+' → '+after.spacingOverlap.toFixed(3)+', owner shift '+maxOwnerMove.toFixed(4)+', attachment '+maxAttachment.toExponential(1)+', max latitude '+maxOffset.toFixed(3)+'rad, solve '+after.spacing.lastMs.toFixed(1)+'ms.';
    running=false;
  };panel.append(spacing);
  const overlap=document.createElement('button');overlap.textContent='Check visible handoff';overlap.onclick=async()=>{
    if(running)return;running=true;document.querySelector('#reset').click();
    await new Promise(requestAnimationFrame);const point=overlapFixture();x=point.x;y=point.y;positioned=true;
    await new Promise(resolve=>setTimeout(resolve,1200));
    const before=state(),next=visiblePoint(tracks[5]);
    move(next.x,next.y);
    const quick=state().target;
    move(point.x,point.y);
    await new Promise(resolve=>setTimeout(resolve,220));const passedThrough=state().target;
    move(next.x,next.y);
    await new Promise(resolve=>setTimeout(resolve,300));const transferred=state();
    host.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,pointerType:'mouse',pointerId:1,bubbles:true}));
    host.dispatchEvent(new PointerEvent('pointerup',{clientX:x,clientY:y,pointerType:'mouse',pointerId:1,bubbles:true}));
    const clicked=state();
    const pass=before.opacity.every(v=>v===1) && quick==='Concreto Incarnat' && passedThrough==='Concreto Incarnat' && transferred.target==='Soft Collision' && clicked.selected==='Soft Collision' && before.stickyRange<=126 && transferred.attachmentError<1e-6;
    sequence.textContent='Visible handoff '+(pass?'PASS':'FAIL')+': all labels solid '+before.opacity.every(v=>v===1)+', brief crossing '+passedThrough+', deliberate hover '+transferred.target+', clicked '+clicked.selected+', radius '+before.stickyRange+'px.';
    running=false;
  };panel.append(overlap);
  const click=document.createElement('button');click.textContent='Click settled track';click.onclick=()=>{
    host.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,pointerType:'mouse',pointerId:1,bubbles:true}));
    host.dispatchEvent(new PointerEvent('pointerup',{clientX:x,clientY:y,pointerType:'mouse',pointerId:1,bubbles:true}));
    result.textContent='Click result: '+state().selected;
  };panel.append(click);
  const hide=document.createElement('button');hide.textContent='Hide check panel';hide.onclick=()=>{panel.hidden=true;};panel.append(hide);
  const away=document.createElement('button');away.textContent='Leave scene';away.onclick=()=>{host.dispatchEvent(new PointerEvent('pointerleave'));cursor.hidden=true;};panel.append(away,status,result,sequence);
  const metrics=document.createElement('button');metrics.textContent='Show layout metrics';metrics.onclick=()=>{const out=document.createElement('pre');out.id='layout-metrics';out.textContent=JSON.stringify(layoutMetrics());panel.append(out);};panel.append(metrics);
  document.body.append(panel,cursor);
  setInterval(()=>{const s=state();status.textContent=`${s.mode} | Target: ${s.target} | Pointer gap: ${s.gap}px (X ${s.gapX}, Y ${s.gapY}) | Turn: ${s.turn}° | Docked: ${s.docked} | Click target: ${s.clickTarget} | Sphere error: ${(s.attachmentError||0).toExponential(1)} | Local pose error: ${(s.localPoseError||0).toExponential(1)} | Speed: ${(s.angularSpeed||0).toFixed(2)} | Selected: ${s.selected}`;},100);
}
