'use client';
import {useEffect,useRef,useState,type ImgHTMLAttributes} from 'react';
export default function SafeImage({src,fallbackSrc,...props}:ImgHTMLAttributes<HTMLImageElement>&{fallbackSrc?:string}){
 const ref=useRef<HTMLImageElement>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{setFailed(false);if(ref.current?.complete&&!ref.current.naturalWidth)setFailed(true);},[src]);
 return <img {...props} ref={ref} src={failed&&fallbackSrc?fallbackSrc:src} onError={()=>setFailed(true)}/>;
}
