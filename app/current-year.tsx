'use client';
import {useEffect,useState} from 'react';
export default function CurrentYear(){
 const [year,setYear]=useState(()=>new Date().getFullYear());
 useEffect(()=>{const update=()=>setYear(new Date().getFullYear());update();const timer=setInterval(update,60000);window.addEventListener('focus',update);return()=>{clearInterval(timer);window.removeEventListener('focus',update);};},[]);
 return <span suppressHydrationWarning>{year}</span>;
}
