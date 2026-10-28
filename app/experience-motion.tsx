'use client';
import {useEffect,useState} from 'react';
export default function ExperienceMotion(){
 const [phase,setPhase]=useState('preparing');const [word,setWord]=useState(0);
 useEffect(()=>{
  const timers:ReturnType<typeof setTimeout>[]=[];let first=true,pending=false;const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff=()=>{try{return media.matches||sessionStorage.getItem('art-motion')==='off';}catch{return media.matches;}};
  try{first=!sessionStorage.getItem('art-intro-seen');pending=!!sessionStorage.getItem('art-transition');sessionStorage.removeItem('art-transition');sessionStorage.setItem('art-intro-seen','1');}catch{}
  if(!motionOff()&&first&&!pending){setPhase('intro');[1,2,3].forEach(i=>timers.push(setTimeout(()=>setWord(i),i*280)));timers.push(setTimeout(()=>setPhase('intro-out'),1250));timers.push(setTimeout(()=>setPhase('idle'),1900));}
  else if(!motionOff()&&pending){setPhase('glass-enter');timers.push(setTimeout(()=>setPhase('idle'),650));}
  else setPhase('idle');
  let navigating=false;
  const navigate=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||motionOff())return;
   const anchor=(event.target as Element)?.closest('a');if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
   const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol)||!['/','/work','/about','/contact','/research'].includes(url.pathname))return;
   if(url.pathname===location.pathname&&url.search===location.search)return;
   event.preventDefault();if(navigating)return;navigating=true;setPhase('glass-leave');try{sessionStorage.setItem('art-transition','glass');}catch{}
   timers.push(setTimeout(()=>location.assign(url.href),380));
  };
  const restore=(event:PageTransitionEvent)=>{if(event.persisted){setPhase('idle');navigating=false;}};
  document.addEventListener('click',navigate);addEventListener('pageshow',restore);return()=>{timers.forEach(clearTimeout);document.removeEventListener('click',navigate);removeEventListener('pageshow',restore);};
 },[]);
 const intro=phase==='intro'||phase==='intro-out';
 return <div className={'experience-transition '+phase} aria-hidden="true">{intro&&<><div className="intro-transition-word"><i/>{['Hola','Hello','Bienvenido','.ART'][word]}</div><span className="intro-transition-credit">ALEXANDER ROZO TORRES</span></>}</div>;
}
