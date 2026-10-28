'use client';
import {useEffect,useRef,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ArrowDown,ArrowUpRight,ArrowLeft,ArrowRight,Pause,Play} from 'lucide-react';
type Lang='es'|'en';
export function CenteredIntro({lang,paused}:{lang:Lang;paused:boolean}){
 const es=lang==='es';const intro=useRef<HTMLElement>(null);
 useEffect(()=>{
  const el=intro.current;if(!el)return;
  if(paused||matchMedia('(prefers-reduced-motion:reduce)').matches){el.style.setProperty('--name-scale','1');el.style.setProperty('--name-y','0px');return;}
  let frame=0;
  const draw=()=>{frame=0;const r=el.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/r.height));el.style.setProperty('--name-scale',String(1+p*1.7));el.style.setProperty('--name-y',`${p*80}px`);};
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};addEventListener('scroll',request,{passive:true});addEventListener('resize',request);request();return()=>{removeEventListener('scroll',request);removeEventListener('resize',request);cancelAnimationFrame(frame);};
 },[paused]);
 return <section ref={intro} className="centered-intro" id="intro"><div className="portrait-aura" aria-hidden="true"/><div className="intro-center"><h1>{es?'Hola, soy Alex.':"Hi, I’m Alex."}</h1><div className="portrait-orbit"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="portrait-circle" d="M120,120 m-100,0 a100,100 0 1,1 200,0 a100,100 0 1,1 -200,0"/></defs><text><textPath href="#portrait-circle" textLength="626">VR / AR / XR CREATOR ✦ ENGINEER ✦ UX / UI DESIGNER ✦ </textPath></text></svg><img src="/images/portrait.jpg" alt="Alexander Rozo Torres" fetchPriority="high"/></div><div className="intro-availability"><span><i/>{es?'Disponible para colaborar':'Available for work'}</span><span><i/>{es?'Oportunidades remotas':'Remote opportunities'}</span></div></div><div className="intro-name" aria-label="Alex Rozo">ALEX <strong>ROZO</strong><span aria-hidden="true">✳</span></div><div className="intro-foot"><span>{es?'DISEÑO · TECNOLOGÍA · CURIOSIDAD':'DESIGN · TECHNOLOGY · CURIOSITY'}</span><a href="#areas">{es?'SIGUE EXPLORANDO':'KEEP EXPLORING'}<ArrowDown size={16}/></a></div></section>;
}
export function ScrollAreas({lang,paused}:{lang:Lang;paused:boolean}){
 const container=useRef<HTMLElement>(null);
 useEffect(()=>{
  const el=container.current;if(!el)return;
  if(paused||matchMedia('(prefers-reduced-motion:reduce)').matches){el.style.setProperty('--area-shift','0px');return;}
  let frame=0,active=false;
  const draw=()=>{frame=0;if(!active)return;const r=el.getBoundingClientRect();const p=(innerHeight*.5-r.top-r.height*.5)/(innerHeight+r.height);el.style.setProperty('--area-shift',`${Math.max(-1,Math.min(1,p))*Math.min(innerWidth*.48,550)}px`);};
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};const io=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;request();},{rootMargin:'100px'});io.observe(el);addEventListener('scroll',request,{passive:true});addEventListener('resize',request);request();return()=>{io.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',request);removeEventListener('resize',request);};
 },[paused]);
 const rows=lang==='es'?['Producto y diseño digital · Arte 3D','Ilustración · No code · Arte generativo','Sistemas inmersivos · Diseño UX/UI']:['Product & digital design · 3D art','Illustration · No code · Art generation','Immersive systems · UX/UI design'];
 return <section ref={container} className="scroll-areas" id="areas" aria-label={lang==='es'?'Mis áreas creativas':'My creative fields'}><span className="eyebrow">{lang==='es'?'DISTINTAS MIRADAS. UNA MISMA CURIOSIDAD.':'DIFFERENT PERSPECTIVES. THE SAME CURIOSITY.'}</span>{rows.map((text,i)=><div className={'area-line area-line-'+i} key={text}><div className="area-track"><span className="area-repeat" aria-hidden="true">{text} ✦</span><h2>{text}</h2><span className="area-repeat" aria-hidden="true">✦ {text}</span></div><span className="area-pointer" aria-hidden="true"><svg viewBox="0 0 20 24"><path d="M1 1L17 12 9 14 6 22Z"/></svg><i/></span></div>)}</section>;
}
export function ScrollMotion({paused,revision}:{paused:boolean;revision:string}){
 useEffect(()=>{
  const cards=[...document.querySelectorAll<HTMLElement>('.project-card,.discipline-card')];
  if(paused||matchMedia('(prefers-reduced-motion:reduce)').matches){cards.forEach(c=>{c.style.removeProperty('--card-scale');c.style.removeProperty('--image-zoom');c.style.removeProperty('--image-shift');c.style.removeProperty('--image-stretch');c.style.removeProperty('--media-width');c.style.removeProperty('--media-height');});return;}
  let frame=0,lastY=scrollY,speed=0;const visible=new Set<HTMLElement>();
  const draw=()=>{frame=0;speed=speed*.78+Math.max(-2,Math.min(2,(scrollY-lastY)/90))*.22;lastY=scrollY;visible.forEach(card=>{const r=card.getBoundingClientRect();const p=Math.max(-1,Math.min(1,(r.top+r.height*.5-innerHeight*.5)/(innerHeight*.8)));card.style.setProperty('--card-scale',String(1-Math.abs(p)*.065));card.style.setProperty('--image-zoom',String(1.04+Math.abs(p)*.19));card.style.setProperty('--image-shift',`${-p*35}px`);card.style.setProperty('--image-stretch',String(1+Math.abs(p)*.11+Math.min(.17,Math.abs(speed)*.14)));card.style.setProperty('--media-width',String(1-Math.abs(p)*.065));card.style.setProperty('--media-height',String(1-Math.abs(p)*.13));});if(Math.abs(speed)>.001)frame=requestAnimationFrame(draw);};
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};const io=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target as HTMLElement):visible.delete(e.target as HTMLElement));request();},{rootMargin:'200px'});cards.forEach(c=>io.observe(c));addEventListener('scroll',request,{passive:true});addEventListener('resize',request);request();return()=>{cancelAnimationFrame(frame);io.disconnect();removeEventListener('scroll',request);removeEventListener('resize',request);};
 },[paused,revision]);return null;
}
export function ScrollMedia({src,fallbackSrc,alt}:{src:string;fallbackSrc?:string;alt:string}){
 return <div className="scroll-media"><img src={src} alt={alt} loading="lazy" onError={e=>{if(fallbackSrc&&e.currentTarget.getAttribute('src')!==fallbackSrc)e.currentTarget.src=fallbackSrc;}}/></div>;
}
export function Exploration({lang,paused}:{lang:Lang;paused:boolean}){
 const es=lang==='es';
 const section=useRef<HTMLElement>(null);
 const [viewport,carousel]=useEmblaCarousel({loop:true,align:'start',duration:35});
 const [selected,setSelected]=useState(0);
 const [playing,setPlaying]=useState(true);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const [inView,setInView]=useState(false);
 const [visible,setVisible]=useState(true);
 const [reduced,setReduced]=useState(true);
 const worlds=[
  {id:'gen-ai',title:es?'Imaginación generativa':'Generative imagination',tag:'GEN AI',alt:es?'Cubo de vidrio que se transforma en un mundo de partículas luminosas':'A glass cube becoming a world of luminous particles'},
  {id:'xr',title:es?'Más allá de la pantalla':'Beyond the screen',tag:'VR / AR / XR',alt:es?'Visor translúcido y ventanas espaciales hacia paisajes inmersivos':'Translucent headset and spatial windows into immersive landscapes'},
  {id:'code-ux',title:es?'De la idea a la interfaz':'From idea to interface',tag:'VIBE CODING · UX / UI',alt:es?'Interfaces de vidrio, cursores y módulos conectados':'Glass interfaces, cursors and connected modules'},
  {id:'data-research',title:es?'Hacer visible lo invisible':'Making the invisible visible',tag:es?'DATOS · INVESTIGACIÓN':'DATA · RESEARCH',alt:es?'Paisaje de datos y una lente que revela conexiones':'A landscape of data and a lens revealing connections'},
  {id:'visual-effects',title:es?'Luz en movimiento':'Light in motion',tag:es?'EFECTOS · MOTION':'VISUAL EFFECTS · MOTION',alt:es?'Escultura iridiscente y ondas de luz violeta y cian':'Iridescent sculpture with flowing violet and cyan light'},
  {id:'modeling-3d',title:es?'Dar forma a las ideas':'Giving ideas form',tag:es?'MODELADO 3D · MATERIALES':'3D MODELING · MATERIALS',alt:es?'Escultura plegada que pasa de malla digital a vidrio nacarado':'Folded sculpture transitioning from wireframe to pearlescent glass'}
 ];
 useEffect(()=>{if(!carousel)return;const update=()=>setSelected(carousel.selectedScrollSnap());update();carousel.on('select',update).on('reInit',update);return()=>{carousel.off('select',update).off('reInit',update);};},[carousel]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion:reduce)');const updateMotion=()=>setReduced(media.matches);const updateVisibility=()=>setVisible(!document.hidden);updateMotion();updateVisibility();media.addEventListener('change',updateMotion);document.addEventListener('visibilitychange',updateVisibility);
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.15});if(section.current)observer.observe(section.current);
  return()=>{media.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility);observer.disconnect();};
 },[]);
 const autoplay=playing&&!paused&&!reduced&&!hovered&&!focused&&inView&&visible;
 useEffect(()=>{if(!carousel||!autoplay)return;const timer=setInterval(()=>carousel.scrollNext(),4500);return()=>clearInterval(timer);},[carousel,autoplay]);
 const manual=(direction:number)=>{setPlaying(false);direction<0?carousel?.scrollPrev(paused||reduced):carousel?.scrollNext(paused||reduced);};
 return <section ref={section} id="exploration" className="exploration-section" aria-roledescription={es?'carrusel':'carousel'} aria-label={es?'Siempre en exploración':'Always in exploration'} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocused(false);}}>
  <div className="exploration-heading"><div><span className="eyebrow">{es?'IDEAS QUE ABREN OTRAS PUERTAS':'IDEAS THAT OPEN NEW DOORS'}</span><h2>{es?'Siempre en':'Always in'}<br/><strong>{es?'exploración.':'exploration.'}</strong></h2></div><a href={'/work?lang='+lang} className="pill-button border">{es?'Explorar Work':'Explore Work'}<ArrowUpRight size={20}/></a></div>
  <div ref={viewport} className="exploration-viewport" onPointerDown={()=>setPlaying(false)}><div className="exploration-track">{worlds.map((w,i)=><div className="exploration-slide" key={w.id} role="group" aria-roledescription={es?'diapositiva':'slide'} aria-label={`${i+1} / ${worlds.length}: ${w.title}`}><a className="exploration-tile" href={`/work?lang=${lang}#work`}><img src={`/images/exploration/${w.id}.png`} alt={w.alt} loading="lazy" width="1536" height="1024"/><div className="exploration-tile-bottom"><div><span>{w.tag}</span><h3>{w.title}</h3></div><span className="media-glass-arrow"><ArrowUpRight/></span></div></a></div>)}</div></div>
  <div className="exploration-bottom"><span>{es?'Ideas en imágenes. Exploraciones visuales creadas con IA.':'Ideas in images. Visual explorations created with AI.'}</span><div className="exploration-controls"><div className="exploration-dots">{worlds.map((w,i)=><button key={w.id} className={selected===i?'selected':''} aria-label={(es?'Ver: ':'View: ')+w.title} aria-pressed={selected===i} onClick={()=>{setPlaying(false);carousel?.scrollTo(i,paused||reduced);}}/>)}</div><button onClick={()=>manual(-1)} aria-label={es?'Exploración anterior':'Previous exploration'}><ArrowLeft size={18}/></button><button onClick={()=>setPlaying(!playing)} disabled={paused||reduced} aria-label={playing?(es?'Pausar carrusel':'Pause carousel'):(es?'Reproducir carrusel':'Play carousel')} aria-pressed={!playing}>{playing?<Pause size={16}/>:<Play size={16}/>}</button><button onClick={()=>manual(1)} aria-label={es?'Siguiente exploración':'Next exploration'}><ArrowRight size={18}/></button></div></div>
 </section>;
}

