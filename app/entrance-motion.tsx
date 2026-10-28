'use client';
import {useEffect} from 'react';

const mediaSelector='.portrait-orbit,.about-photo,.project-visual,.film-cover,.exploration-viewport,.discipline-fan,.toolbox-lane';
const selector='main h1,main h2,main h3,main p,main .eyebrow,main .intro-availability,'+mediaSelector.split(',').map(s=>'main '+s).join(',')+',footer h2,footer .eyebrow,footer .love-section>p';

// Progressive enhancement: the document stays readable when scripting or motion is off.
export function EntranceMotion({paused,page}:{paused:boolean;page:string}){
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const elements=new Set<HTMLElement>(),waiting=new Set<HTMLElement>(),animations=new Set<Animation>();
  let stopped=false,frame=0;
  const disabled=()=>paused||reduced.matches;
  const overlay=document.querySelector('.experience-transition');
  const ready=()=>!overlay||overlay.classList.contains('idle');
  const reveal=(el:HTMLElement,instant=false)=>{
   waiting.delete(el);observer.unobserve(el);
   if(!el.isConnected)return;
   el.dataset.enterState='done';
   if(instant||disabled())return;
   const isMedia=el.dataset.enterKind==='media';
   const animation=el.animate([
    {opacity:0,translate:`0 ${isMedia?28:38}px`,filter:`blur(${isMedia?3:7}px)`},
    {opacity:1,translate:'0 0',filter:'blur(0px)'}
   ],{duration:isMedia?1050:850,delay:Number(el.dataset.enterDelay||0),easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
   animations.add(animation);
   animation.onfinish=()=>{animation.cancel();animations.delete(animation);};
  };
  const flush=()=>{
   if(stopped)return;
   if(disabled()){elements.forEach(el=>reveal(el,true));animations.forEach(a=>a.cancel());animations.clear();return;}
   if(!ready())return;
   waiting.forEach(el=>reveal(el));
  };
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(flush);});};
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting)waiting.add(entry.target as HTMLElement);else waiting.delete(entry.target as HTMLElement);});schedule();
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  const discover=()=>{
   document.querySelectorAll<HTMLElement>(selector).forEach((el,index)=>{
    if(elements.has(el)||el.closest('[aria-hidden="true"],dialog'))return;
    elements.add(el);el.dataset.enterKind=el.matches(mediaSelector)?'media':'text';el.dataset.enterDelay=String(index%3*70);
    if(disabled()){el.dataset.enterState='done';return;}
    el.dataset.enterState='waiting';observer.observe(el);
   });
  };
  discover();
  const changes=new MutationObserver(discover);const main=document.querySelector('main');
  if(main)changes.observe(main,{childList:true,subtree:true});
  const transition=new MutationObserver(schedule);if(overlay)transition.observe(overlay,{attributes:true,attributeFilter:['class']});
  const focus=(event:FocusEvent)=>{const target=(event.target as HTMLElement).closest<HTMLElement>('[data-enter-state="waiting"]');if(target)reveal(target,true);};
  reduced.addEventListener('change',flush);document.addEventListener('focusin',focus);
  return()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();changes.disconnect();transition.disconnect();animations.forEach(a=>a.cancel());elements.forEach(el=>{delete el.dataset.enterState;delete el.dataset.enterKind;delete el.dataset.enterDelay;});reduced.removeEventListener('change',flush);document.removeEventListener('focusin',focus);};
 },[paused,page]);
 return null;
}
