'use client';
import {useEffect,useRef,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {ArrowDown,ArrowUpRight,ArrowLeft,ArrowRight,Pause,Play} from 'lucide-react';
import {IntroPortrait,InteractiveAreas} from './interactive-details';
import {IntroScrollGlass} from './scroll-glass';
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
 return <><IntroScrollGlass paused={paused}/><section ref={intro} className="centered-intro" id="intro"><div className="portrait-aura" aria-hidden="true"/><div className="intro-center"><h1>{es?'Hola, soy Alex.':"Hi, I’m Alex."}</h1><IntroPortrait/><div className="intro-availability"><span><i/>{es?'Disponible para colaborar':'Available for work'}</span><span><i/>{es?'Oportunidades remotas':'Remote opportunities'}</span></div></div><div className="intro-name" aria-label="Alex Rozo">ALEX <strong>ROZO</strong><span aria-hidden="true">✳</span></div><div className="intro-foot"><span>{es?'DISEÑO · TECNOLOGÍA · CURIOSIDAD':'DESIGN · TECHNOLOGY · CURIOSITY'}</span><a href="#areas">{es?'SIGUE EXPLORANDO':'KEEP EXPLORING'}<ArrowDown size={16}/></a></div></section></>;
}
export function ScrollAreas({lang,paused}:{lang:Lang;paused:boolean}){return <InteractiveAreas lang={lang} paused={paused}/>;}
export function ScrollMedia({src,fallbackSrc,alt}:{src:string;fallbackSrc?:string;alt:string}){
 return <div className="scroll-media"><canvas aria-hidden="true"/><img src={src} alt={alt} loading="lazy" onError={e=>{if(fallbackSrc&&e.currentTarget.getAttribute('src')!==fallbackSrc)e.currentTarget.src=fallbackSrc;}}/></div>;
}
export function Exploration({lang,paused}:{lang:Lang;paused:boolean}){
 const es=lang==='es';
 const section=useRef<HTMLElement>(null);
 const [viewport,carousel]=useEmblaCarousel({loop:true,align:'start',duration:35});
 const [selected,setSelected]=useState(0);
 const [playing,setPlaying]=useState(true);
 const [dragging,setDragging]=useState(false);
 const [cycle,setCycle]=useState(0);
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
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:0,rootMargin:'60px'});if(section.current)observer.observe(section.current);
  return()=>{media.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility);observer.disconnect();};
 },[]);
 useEffect(()=>{if(!carousel)return;const down=()=>setDragging(true),up=()=>{setDragging(false);setCycle(n=>n+1);};carousel.on('pointerDown',down).on('pointerUp',up);return()=>{carousel.off('pointerDown',down).off('pointerUp',up);};},[carousel]);
 const enabled=playing&&!paused&&!reduced;
 const autoplay=enabled&&!dragging&&!focused&&inView&&visible;
 useEffect(()=>{if(!carousel||!autoplay)return;const timer=setInterval(()=>carousel.scrollNext(),4200);return()=>clearInterval(timer);},[carousel,autoplay,cycle]);
 const manual=(direction:number)=>{setCycle(n=>n+1);direction<0?carousel?.scrollPrev(paused||reduced):carousel?.scrollNext(paused||reduced);};
 return <section ref={section} id="exploration" className="exploration-section" data-running={autoplay} aria-roledescription={es?'carrusel':'carousel'} aria-label={es?'Siempre en exploración':'Always in exploration'} onFocusCapture={e=>setFocused(!!(e.target as HTMLElement).closest('.exploration-tile')&&(e.target as HTMLElement).matches(':focus-visible'))} onBlurCapture={()=>setFocused(false)}>
  <div className="exploration-heading"><div><span className="eyebrow">{es?'IDEAS QUE ABREN OTRAS PUERTAS':'IDEAS THAT OPEN NEW DOORS'}</span><h2>{es?'Siempre en':'Always in'}<br/><strong>{es?'exploración.':'exploration.'}</strong></h2></div><a href={'/work?lang='+lang} className="pill-button border">{es?'Explorar Work':'Explore Work'}<ArrowUpRight size={20}/></a></div>
  <div ref={viewport} className="exploration-viewport"><div className="exploration-track" aria-live="off">{worlds.map((w,i)=><div className="exploration-slide" key={w.id} role="group" aria-roledescription={es?'diapositiva':'slide'} aria-label={`${i+1} / ${worlds.length}: ${w.title}`}><a className="exploration-tile" href={`/work?lang=${lang}#work`}><img src={`/images/exploration/${w.id}.png`} alt={w.alt} loading="lazy" width="1536" height="1024"/><div className="exploration-tile-bottom"><div><span>{w.tag}</span><h3>{w.title}</h3></div><span className="media-glass-arrow"><ArrowUpRight/></span></div></a></div>)}</div></div>
  <div className="exploration-bottom"><span>{es?'Ideas en imágenes. Exploraciones visuales creadas con IA.':'Ideas in images. Visual explorations created with AI.'}</span><div className="exploration-controls"><div className="exploration-dots">{worlds.map((w,i)=><button key={w.id} className={selected===i?'selected':''} aria-label={(es?'Ver: ':'View: ')+w.title} aria-pressed={selected===i} onClick={()=>{setCycle(n=>n+1);carousel?.scrollTo(i,paused||reduced);}}/>)}</div><button onClick={()=>manual(-1)} aria-label={es?'Exploración anterior':'Previous exploration'}><ArrowLeft size={18}/></button><button onClick={()=>{setPlaying(!playing);setFocused(false);setCycle(n=>n+1);}} disabled={paused||reduced} aria-label={enabled?(es?'Pausar carrusel':'Pause carousel'):(es?'Reproducir carrusel':'Play carousel')} aria-pressed={!enabled}>{enabled?<Pause size={16}/>:<Play size={16}/>}</button><button onClick={()=>manual(1)} aria-label={es?'Siguiente exploración':'Next exploration'}><ArrowRight size={18}/></button></div></div>
 </section>;
}

