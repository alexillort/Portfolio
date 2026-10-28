'use client';
import {useEffect} from 'react';

type Surface={el:HTMLElement;image:HTMLImageElement;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;active:boolean;started:number;ready:boolean;lastWidth:number;lastHeight:number};
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));

// Independent scanline renderer: the horizontal stretch varies with screen height.
// This bends the actual pixels and silhouette instead of scaling a rectangular card.
export function SurfaceMotion({paused,revision}:{paused:boolean;revision:string}){
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion:reduce)');let stopped=false,frame=0,lastY=scrollY,lastTime=performance.now(),energy=0;
  const surfaces:Surface[]=[];
  document.querySelectorAll<HTMLElement>('.scroll-media').forEach(el=>{
   const image=el.querySelector('img'),canvas=el.querySelector('canvas');if(!image||!canvas)return;const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
   surfaces.push({el,image,canvas,ctx,active:false,started:0,ready:false,lastWidth:0,lastHeight:0});
  });
  const disabled=()=>paused||media.matches;
  const draw=(time:number)=>{
   frame=0;if(stopped||document.hidden)return;
   const dt=clamp(time-lastTime,8,60),delta=scrollY-lastY;lastTime=time;lastY=scrollY;
   energy=Math.max(Math.abs(delta)*16.67/dt,energy*Math.pow(.91,dt/16.67));
   const ripple=disabled()?0:Math.min(.07,energy*.0026);
   let animating=false;
   surfaces.forEach(s=>{
    if(!s.active)return;
    if(disabled()){s.el.classList.remove('surface-ready');return;}
    const rect=s.el.getBoundingClientRect(),w=rect.width,h=rect.height;
    if(w<1||h<1||!s.image.complete||!s.image.naturalWidth)return;
    if(rect.top>innerHeight+80||rect.bottom< -80)return;
    if(!s.started)s.started=time;
    const age=clamp((time-s.started)/900,0,1),reveal=1-Math.pow(1-age,4);
    if(age<1)animating=true;
    const dpr=Math.min(devicePixelRatio||1,1.5),margin=w*.24,cw=w+margin*2;
    if(s.lastWidth!==w||s.lastHeight!==h){s.canvas.width=Math.ceil(cw*dpr);s.canvas.height=Math.ceil(h*dpr);s.canvas.style.width=`${cw}px`;s.canvas.style.height=`${h}px`;s.canvas.style.left=`${-margin}px`;s.lastWidth=w;s.lastHeight=h;}
    const {ctx}=s;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cw,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const opening=.91+reveal*.09,drawW=w*opening,drawH=h*opening,offsetX=(w-drawW)/2,offsetY=(h-drawH)/2;
    const iw=s.image.naturalWidth,ih=s.image.naturalHeight,zoom=1.015+(1-reveal)*.035;
    const cover=Math.max(w/iw,h/ih)*zoom,sourceW=w/cover,sourceH=h/cover;
    const sourceX=(iw-sourceW)/2,sourceY=(ih-sourceH)/2;
    const radius=Math.min(18,drawH*.08),step=1/dpr;
    for(let y=0;y<drawH;y+=step){
     const slice=Math.min(step,drawH-y),mid=y+slice*.5;
     const screenY=clamp((rect.top+offsetY+mid)/innerHeight,0,1);
     const edge=Math.pow(Math.abs(screenY-.5)*2,2);
     const stretch=1+ripple*edge;
     const corner=mid<radius?radius-mid:mid>drawH-radius?mid-(drawH-radius):0;
     const inset=corner>0?radius-Math.sqrt(Math.max(0,radius*radius-corner*corner)):0;
     const left=offsetX+inset,right=offsetX+drawW-inset;
     const globalLeft=rect.left+left,globalRight=rect.left+right;
     const dx=margin+(globalLeft-innerWidth*.5)*stretch+innerWidth*.5-rect.left;
     const dw=(globalRight-globalLeft)*stretch;
     const sx=sourceX+(left-offsetX)/drawW*sourceW,sy=sourceY+y/drawH*sourceH;
     const sw=(right-left)/drawW*sourceW,sh=Math.min(sourceH-(sy-sourceY),slice/drawH*sourceH);
     if(sw>0&&sh>0)ctx.drawImage(s.image,sx,sy,sw,sh,dx,offsetY+y,dw,slice+.02);
    }
    s.ready=true;s.el.classList.add('surface-ready');s.el.dataset.surfaceWarp=ripple.toFixed(3);
   });
   if((energy>.03||animating)&&!disabled())frame=requestAnimationFrame(draw);
  };
  const request=()=>{if(!frame&&!stopped)frame=requestAnimationFrame(draw);};
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{const s=surfaces.find(x=>x.el===entry.target);if(!s)return;s.active=entry.isIntersecting;if(!s.active)s.started=0;});request();},{rootMargin:'90px'});
  surfaces.forEach(s=>{observer.observe(s.el);s.image.addEventListener('load',request);});
  const resize=new ResizeObserver(request);surfaces.forEach(s=>resize.observe(s.el));
  const motionChange=()=>{surfaces.forEach(s=>s.el.classList.remove('surface-ready'));request();};
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request);document.addEventListener('visibilitychange',request);media.addEventListener('change',motionChange);request();
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();surfaces.forEach(s=>{s.image.removeEventListener('load',request);s.el.classList.remove('surface-ready');delete s.el.dataset.surfaceWarp;});removeEventListener('scroll',request);removeEventListener('resize',request);document.removeEventListener('visibilitychange',request);media.removeEventListener('change',motionChange);};
 },[paused,revision]);return null;
}

