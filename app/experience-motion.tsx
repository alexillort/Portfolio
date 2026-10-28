'use client';
import {useEffect,useState} from 'react';
export default function ExperienceMotion(){
 const [phase,setPhase]=useState('intro');const [label,setLabel]=useState('.ART');const [word,setWord]=useState(0);
 useEffect(()=>{
  let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;try{reduced=reduced||sessionStorage.getItem('art-motion')==='off';}catch{}const timers:ReturnType<typeof setTimeout>[]=[];
  let first=true,pending='';try{first=!sessionStorage.getItem('art-intro-seen');pending=sessionStorage.getItem('art-transition')||'';sessionStorage.removeItem('art-transition');sessionStorage.setItem('art-intro-seen','1');}catch{}
  if(reduced){setPhase('idle');}else if(pending||!first){setLabel(pending||'.ART');setPhase('entering');timers.push(setTimeout(()=>setPhase('idle'),850));}
  else{setPhase('intro');[1,2,3].forEach((i)=>timers.push(setTimeout(()=>setWord(i),i*300)));timers.push(setTimeout(()=>setPhase('entering'),1300));timers.push(setTimeout(()=>setPhase('idle'),2150));}
  const navigate=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const anchor=(event.target as Element)?.closest('a');if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
   const url=new URL(anchor.href,location.href);if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))return;
   if(url.pathname===location.pathname&&url.search===location.search)return;
   let motionOff=false;try{motionOff=sessionStorage.getItem('art-motion')==='off';}catch{}if(reduced||motionOff)return;event.preventDefault();const titles:Record<string,string>={'/':'Home','/work':'Work','/about':'About','/contact':'Contact','/research':'Research'};const next=titles[url.pathname]||'.ART';
   setLabel(next);setPhase('leaving');try{sessionStorage.setItem('art-transition',next);}catch{}
   timers.push(setTimeout(()=>location.assign(url.href),550));
  };
  const restore=(event:PageTransitionEvent)=>{if(event.persisted)setPhase('idle');};document.addEventListener('click',navigate);window.addEventListener('pageshow',restore);
  return()=>{timers.forEach(clearTimeout);document.removeEventListener('click',navigate);window.removeEventListener('pageshow',restore);};
 },[]);
 return <div className={'transition-screen '+phase} aria-hidden="true"><div className="transition-word"><i/>{phase==='intro'?['Hola','Hello','Bienvenido','.ART'][word]:label}</div><span className="transition-credit">ALEXANDER ROZO TORRES</span></div>;
}

