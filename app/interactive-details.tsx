'use client';
import {useEffect,useRef} from 'react';

// The portrait stays photographic; glass belongs to the scroll transition only.
export function IntroPortrait(){
 return <div className="portrait-orbit intro-portrait"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="portrait-circle" d="M120,120 m-107,0 a107,107 0 1,1 214,0 a107,107 0 1,1 -214,0"/></defs><text><textPath href="#portrait-circle" textLength="671">VR / AR / XR CREATOR ✦ ENGINEER ✦ UX / UI DESIGNER ✦ </textPath></text></svg><img src="/images/portrait.jpg" alt="Alexander Rozo Torres" fetchPriority="high"/></div>;
}

export function InteractiveAreas({lang,paused}:{lang:'es'|'en';paused:boolean}){
 const root=useRef<HTMLElement>(null);
 const rows=lang==='es'?[
  ['Producto digital','Diseño UX/UI','Arte 3D'],
  ['Vibe Coding','Prompt Engineering','Agentes de IA'],
  ['Motion Graphics','Ilustración','IA generativa','No code'],
  ['AR / XR / VR','Computación espacial','Investigación HCI']
 ]:[
  ['Digital product','UX/UI design','3D art'],
  ['Vibe Coding','Prompt Engineering','AI agents'],
  ['Motion Graphics','Illustration','Generative AI','No code'],
  ['AR / XR / VR','Spatial computing','HCI research']
 ];
 useEffect(()=>{
  const el=root.current;if(!el)return;
  const media=matchMedia('(prefers-reduced-motion:reduce)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');let frame=0,active=false,last=0;
  const lines=Array.from(el.querySelectorAll<HTMLElement>('.area-line')).map((line,i)=>({line,i,x:0,y:0,px:0,py:0,hover:false,clientX:0,clientY:0,glyphs:Array.from(line.querySelectorAll<HTMLElement>('.area-glyph')).map(glyph=>({glyph,ink:glyph.querySelector<HTMLElement>('.area-glyph-ink')!,weight:400,x:0,y:0,space:0}))}));
  const disabled=()=>paused||media.matches;
  const clear=()=>{el.style.setProperty('--area-shift','0px');lines.forEach(({line,glyphs})=>{line.style.removeProperty('--pointer-x');line.style.removeProperty('--pointer-y');glyphs.forEach(g=>{g.weight=400;g.x=0;g.y=0;g.space=0;g.ink.style.removeProperty('font-weight');g.glyph.style.removeProperty('--glyph-space');g.ink.style.removeProperty('--glyph-x');g.ink.style.removeProperty('--glyph-y');});});};
  const draw=(now:number)=>{
   frame=0;if(disabled()){clear();return;}if(!active||document.hidden)return;
   if(now-last>25){last=now;const r=el.getBoundingClientRect(),progress=(innerHeight*.5-r.top-r.height*.5)/(innerHeight+r.height);el.style.setProperty('--area-shift',`${Math.max(-1,Math.min(1,progress))*Math.min(innerWidth*.48,550)}px`);
    lines.forEach(s=>{
     const box=s.line.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;
     const tx=s.hover?s.px:Math.sin(now/1900+s.i*1.8)*Math.min(innerWidth*.17,200),ty=s.hover?s.py:Math.cos(now/1500+s.i)*12;
     s.x+=(tx-s.x)*.12;s.y+=(ty-s.y)*.12;s.line.style.setProperty('--pointer-x',`${s.x}px`);s.line.style.setProperty('--pointer-y',`${s.y}px`);
     // Variable glyph advances and tracking let the surrounding text reflow gently.
     // Measure the outer glyph boxes, never the translated ink, to avoid feedback.
     const targets=s.glyphs.map(g=>{
      if(!s.hover||!pointer.matches)return {weight:400,x:0,y:0,space:0};
      const b=g.glyph.getBoundingClientRect(),dx=b.left+b.width/2-s.clientX,dy=b.top+b.height/2-s.clientY;
      const distance=Math.hypot(dx,dy*1.35),proximity=Math.max(0,1-distance/190),influence=proximity*proximity*(3-2*proximity);
      return {weight:400+500*influence,x:Math.tanh(dx/65)*b.height*.12*influence,y:-b.height*.13*influence,space:b.height*.018*influence};
     });
     s.glyphs.forEach((g,i)=>{
      const t=targets[i];g.weight+=(t.weight-g.weight)*.24;
      g.x+=(t.x-g.x)*.16;g.y+=(t.y-g.y)*.16;g.space+=(t.space-g.space)*.16;
      if(Math.abs(t.weight-g.weight)<.5)g.weight=t.weight;
      if(Math.abs(t.x-g.x)<.01)g.x=t.x;if(Math.abs(t.y-g.y)<.01)g.y=t.y;if(Math.abs(t.space-g.space)<.001)g.space=t.space;
      g.ink.style.fontWeight=g.weight.toFixed(1);g.glyph.style.setProperty('--glyph-space',`${g.space.toFixed(3)}px`);
      g.ink.style.setProperty('--glyph-x',`${g.x.toFixed(2)}px`);g.ink.style.setProperty('--glyph-y',`${g.y.toFixed(2)}px`);
     });
    });
   }
   frame=requestAnimationFrame(draw);
  };
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const listeners=lines.map(s=>{
   const move=(e:PointerEvent)=>{if(e.pointerType==='touch'||!pointer.matches)return;const b=s.line.getBoundingClientRect();s.hover=true;s.clientX=e.clientX;s.clientY=e.clientY;s.px=e.clientX-b.left-b.width*.5;s.py=e.clientY-b.bottom+16;request();};
   const leave=()=>{s.hover=false;};s.line.addEventListener('pointermove',move);s.line.addEventListener('pointerleave',leave);s.line.addEventListener('pointercancel',leave);window.addEventListener('blur',leave);return()=>{s.line.removeEventListener('pointermove',move);s.line.removeEventListener('pointerleave',leave);s.line.removeEventListener('pointercancel',leave);window.removeEventListener('blur',leave);};
  });
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;request();});observer.observe(el);media.addEventListener('change',request);document.addEventListener('visibilitychange',request);request();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();listeners.forEach(remove=>remove());media.removeEventListener('change',request);document.removeEventListener('visibilitychange',request);clear();};
 },[paused,lang]);
 return <section ref={root} className="scroll-areas interactive-areas" id="areas" aria-label={lang==='es'?'Mis áreas creativas':'My creative fields'}><span className="eyebrow">{lang==='es'?'DISTINTAS MIRADAS. UNA MISMA CURIOSIDAD.':'DIFFERENT PERSPECTIVES. THE SAME CURIOSITY.'}</span>{rows.map((words,i)=>{
  const content=words.map((word,j)=><span key={word}><span className="area-word" aria-hidden="true">{Array.from(word).map((char,k)=><span className="area-glyph" data-char={char} key={k}><span className="area-glyph-ink">{char}</span></span>)}</span>{j<words.length-1&&<span className="area-separator"> · </span>}</span>);
  return <div className={`area-line area-line-${i}`} key={i}><div className="area-track"><span className="area-repeat" aria-hidden="true">{content} ✦</span><h2 aria-label={words.join(' · ')}>{content}</h2><span className="area-repeat" aria-hidden="true">✦ {content}</span></div><span className="area-pointer" aria-hidden="true"><svg viewBox="0 0 20 24"><path d="M1 1L17 12 9 14 6 22Z"/></svg><i/></span></div>;
 })}</section>;
}

export function LiquidCursor({paused,dialogOpen}:{paused:boolean;dialogOpen:boolean}){
 const body=useRef<HTMLDivElement>(null),trail=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const el=body.current,tail=trail.current;if(!el||!tail)return;
  const media=matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)');let frame=0,show=false,attached=false,tx=0,ty=0,x=0,y=0,tailX=0,tailY=0,w=26,h=26,tw=26,th=26;
  const enabled=()=>!paused&&!dialogOpen&&media.matches;
  const sync=()=>{document.documentElement.classList.toggle('liquid-cursor-enabled',enabled());if(!enabled()){show=false;el.style.opacity='0';tail.style.opacity='0';}};
  const draw=()=>{
   frame=0;if(!show||!enabled())return;
   const dx=tx-x,dy=ty-y;x+=dx*.24;y+=dy*.24;w+=(tw-w)*.2;h+=(th-h)*.2;tailX+=(x-tailX)*.3;tailY+=(y-tailY)*.3;
   const speed=Math.min(Math.hypot(dx,dy)/120,.35);
   el.style.width=`${w}px`;el.style.height=`${h}px`;el.style.transform=`translate3d(${x-w/2}px,${y-h/2}px,0) rotate(${attached?0:Math.atan2(dy,dx)*180/Math.PI}deg) scale(${attached?1:1+speed},${attached?1:1-speed*.5})`;
   tail.style.transform=`translate3d(${tailX-8}px,${tailY-8}px,0) scale(${attached?.35:Math.min(1,speed*3)})`;tail.style.opacity=attached?'0':String(speed*.8);
   if(Math.abs(dx)+Math.abs(dy)+Math.abs(tw-w)+Math.abs(th-h)>.15)frame=requestAnimationFrame(draw);
  };
  const move=(e:PointerEvent)=>{
   if(!enabled()||e.pointerType==='touch')return;
   if((e.target as Element).closest('.project-visual')?.closest('.project-card')||(e.target as Element).closest('.exploration-tile[data-pointer-active="true"]')){show=false;el.style.opacity='0';tail.style.opacity='0';return;}
   const target=(e.target as Element).closest<HTMLElement>('a,button');let rect=target?.getBoundingClientRect();
   if(rect&&(rect.width>350||rect.height>90)){const pill=target?.querySelector<HTMLElement>('.project-view,.media-glass-arrow');rect=pill?.getBoundingClientRect();}
   attached=!!rect&&rect.width<=350&&rect.height<=90;
   tx=attached&&rect?rect.left+rect.width/2+(e.clientX-rect.left-rect.width/2)*.07:e.clientX;ty=attached&&rect?rect.top+rect.height/2+(e.clientY-rect.top-rect.height/2)*.07:e.clientY;
   tw=attached&&rect?rect.width+10:26;th=attached&&rect?rect.height+10:26;
   if(!show){x=tx;y=ty;tailX=tx;tailY=ty;}show=true;el.dataset.attached=String(attached);el.style.opacity='1';if(!frame)frame=requestAnimationFrame(draw);
  };
  const leave=()=>{show=false;el.style.opacity='0';tail.style.opacity='0';};
  sync();media.addEventListener('change',sync);document.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);document.addEventListener('scroll',leave,{passive:true});
  return()=>{cancelAnimationFrame(frame);document.documentElement.classList.remove('liquid-cursor-enabled');media.removeEventListener('change',sync);document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);document.removeEventListener('scroll',leave);};
 },[paused,dialogOpen]);
 return <><span ref={trail} className="liquid-cursor-trail" aria-hidden="true"/><div ref={body} className="custom-cursor liquid-cursor" aria-hidden="true"/></>;
}

// Desktop followers stay inside their media; exploration retains its corner arrow otherwise.
export function ProjectHoverActions({paused,revision}:{paused:boolean;revision:string}){
 useEffect(()=>{
  const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const states=Array.from(document.querySelectorAll<HTMLElement>('.project-card,.exploration-tile')).flatMap(card=>{
   const exploration=card.matches('.exploration-tile');
   const visual=exploration?card:card.querySelector<HTMLElement>('.project-visual'),pill=card.querySelector<HTMLElement>(exploration?'.exploration-pointer-action':'.project-view');
   return visual&&pill?[{card,visual,pill,exploration,x:0,y:0,tx:0,ty:0,clientX:0,clientY:0,frame:0,active:false}]:[];
  });
  const cleanups=states.map(s=>{
   const reset=()=>{s.active=false;cancelAnimationFrame(s.frame);s.frame=0;delete s.card.dataset.pointerActive;s.visual.style.removeProperty('--project-cta-x');s.visual.style.removeProperty('--project-cta-y');};
   const position=()=>{
    const r=s.visual.getBoundingClientRect(),mx=Math.min(r.width/2,s.pill.offsetWidth/2+14),my=Math.min(r.height/2,s.pill.offsetHeight/2+14);
    s.tx=Math.max(mx,Math.min(r.width-mx,s.clientX-r.left));s.ty=Math.max(my,Math.min(r.height-my,s.clientY-r.top));
   };
   const draw=()=>{
    s.frame=0;if(!s.active)return;
    if(s.exploration){
     if(document.hidden||document.elementFromPoint(s.clientX,s.clientY)?.closest('.exploration-tile')!==s.card){reset();return;}
     position();
    }
    s.x+=(s.tx-s.x)*.24;s.y+=(s.ty-s.y)*.24;
    s.visual.style.setProperty('--project-cta-x',`${s.x}px`);s.visual.style.setProperty('--project-cta-y',`${s.y}px`);
    if(s.exploration||Math.abs(s.tx-s.x)+Math.abs(s.ty-s.y)>.2)s.frame=requestAnimationFrame(draw);
   };
   const move=(e:PointerEvent)=>{
    if(paused||!media.matches||e.pointerType==='touch')return;
    s.clientX=e.clientX;s.clientY=e.clientY;position();
    if(!s.active){s.x=s.tx;s.y=s.ty;s.active=true;}s.card.dataset.pointerActive='true';if(!s.frame)s.frame=requestAnimationFrame(draw);
   };
   const focus=()=>{if(s.card.matches(':focus-visible'))reset();};
   s.visual.addEventListener('pointermove',move);s.visual.addEventListener('pointerenter',move);s.card.addEventListener('pointerleave',reset);s.card.addEventListener('pointercancel',reset);s.card.addEventListener('focus',focus);media.addEventListener('change',reset);window.addEventListener('blur',reset);document.addEventListener('visibilitychange',reset);
   return()=>{reset();s.visual.removeEventListener('pointermove',move);s.visual.removeEventListener('pointerenter',move);s.card.removeEventListener('pointerleave',reset);s.card.removeEventListener('pointercancel',reset);s.card.removeEventListener('focus',focus);media.removeEventListener('change',reset);window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',reset);};
  });
  return()=>cleanups.forEach(cleanup=>cleanup());
 },[paused,revision]);return null;
}
