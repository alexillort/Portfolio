'use client';
import {useEffect,useRef} from 'react';

export function IntroScrollGlass({paused}:{paused:boolean}){
 const layer=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=layer.current,intro=document.getElementById('intro'),photo=intro?.querySelector<HTMLElement>('.intro-portrait>img');
  if(!el||!intro||!photo)return;
  const media=matchMedia('(prefers-reduced-motion:reduce)');
  const clamp=(n:number)=>Math.max(0,Math.min(1,n));
  const range=()=>Math.min(260,innerHeight*.29);
  const progress=()=>clamp((-intro.getBoundingClientRect().top-24)/range());
  let frame=0,current=progress(),last=0;
  const hide=()=>{el.dataset.active='false';el.style.setProperty('--glass-opacity','0');};
  const draw=(now:number)=>{
   frame=0;
   if(paused||media.matches||document.hidden){hide();current=progress();return;}
   const target=progress(),dt=last?Math.min(48,now-last):16;last=now;
   // A short catch-up keeps one fast wheel gesture visible without hijacking scroll.
   current+=(target-current)*(1-Math.exp(-dt/42));
   if(Math.abs(target-current)<.002)current=target;
   if(current>.006&&current<.994){
    const r=photo.getBoundingClientRect(),distance=Math.max(0,-intro.getBoundingClientRect().top);
    const cx=r.left+r.width/2,cy=r.top+r.height/2+Math.max(0,distance-range()*.35);
    const cover=2*Math.hypot(Math.max(cx,innerWidth-cx),Math.max(cy,innerHeight-cy));
    const expansion=current*current*(3-2*current),pulse=Math.pow(Math.sin(Math.PI*current),.8);
    el.style.setProperty('--glass-x',`${cx}px`);el.style.setProperty('--glass-y',`${cy}px`);
    el.style.setProperty('--glass-size',`${r.width+(cover-r.width)*expansion}px`);
    el.style.setProperty('--glass-blur',`${pulse*13}px`);el.style.setProperty('--glass-opacity',String(pulse*.94));
    el.dataset.active='true';
   }else hide();
   if(current!==target)frame=requestAnimationFrame(draw);
  };
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const reset=()=>{current=progress();last=0;request();};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',reset);document.addEventListener('visibilitychange',reset);media.addEventListener('change',reset);request();
  return()=>{cancelAnimationFrame(frame);hide();removeEventListener('scroll',request);removeEventListener('resize',reset);document.removeEventListener('visibilitychange',reset);media.removeEventListener('change',reset);};
 },[paused]);
 return <div ref={layer} className="intro-scroll-glass" aria-hidden="true" data-active="false"><div className="intro-glass-wave"/></div>;
}
