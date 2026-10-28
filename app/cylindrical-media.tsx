'use client';
import {useEffect,useRef,useState} from 'react';
export default function CylindricalMedia({src,fallbackSrc,alt,paused}:{src:string;fallbackSrc?:string;alt:string;paused:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);const [ready,setReady]=useState(false);
 useEffect(()=>{
  setReady(false);if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const el=canvas.current;if(!el)return;const gl=el.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;
  const shader=(kind:number,source:string)=>{const s=gl.createShader(kind)!;gl.shaderSource(s,source);gl.compileShader(s);return s;};
  const v=shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}');
  const f=shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D tex;uniform float bend;uniform vec2 ratios;varying vec2 uv;void main(){vec2 q=uv;float y=(q.y-.5)*2.;float angle=asin(clamp(y*.66,-.99,.99));q.y=.5+angle/(2.*asin(.66));float side=1.-bend*.20*(y*y);q.x=(q.x-.5)/side+.5;if(q.x<0.||q.x>1.){gl_FragColor=vec4(0.);return;}q=(q-.5)*ratios+.5;vec4 c=texture2D(tex,q);float shade=1.-bend*.22*(1.-cos(angle));gl_FragColor=vec4(c.rgb*shade,c.a);}`);
  const program=gl.createProgram()!;gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  const bend=gl.getUniformLocation(program,'bend'),ratios=gl.getUniformLocation(program,'ratios');let active=false,loaded=false,frame=0,disposed=false;
  const img=new Image();img.crossOrigin='anonymous';
  const draw=()=>{frame=0;if(!loaded||!active||disposed)return;const r=el.getBoundingClientRect();const d=Math.min(devicePixelRatio,1.25);if(el.width!==Math.round(r.width*d)||el.height!==Math.round(r.height*d)){el.width=Math.round(r.width*d);el.height=Math.round(r.height*d);gl.viewport(0,0,el.width,el.height);}const scroll=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));gl.uniform1f(bend,.65+Math.abs(scroll)*1.3);const ia=img.naturalWidth/img.naturalHeight,ca=r.width/r.height;gl.uniform2f(ratios,Math.min(1,ca/ia),Math.min(1,ia/ca));gl.drawArrays(gl.TRIANGLES,0,6);setReady(true);el.style.transform='perspective(1300px) rotateX('+(-scroll*13)+'deg)';};
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  img.onload=()=>{if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);loaded=true;request();}catch{setReady(false);}};img.src=src;
  const io=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;request();},{rootMargin:'150px'});io.observe(el);const ro=new ResizeObserver(request);ro.observe(el);addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
  return()=>{disposed=true;cancelAnimationFrame(frame);io.disconnect();ro.disconnect();removeEventListener('scroll',request);removeEventListener('resize',request);gl.deleteTexture(texture);gl.deleteBuffer(buf);gl.deleteProgram(program);gl.deleteShader(v);gl.deleteShader(f);};
 },[src,paused]);
 return <div className={'cylindrical-media '+(ready?'ready':'')}><img src={src} alt={alt} loading="lazy" onError={e=>{if(fallbackSrc&&e.currentTarget.getAttribute('src')!==fallbackSrc)e.currentTarget.src=fallbackSrc;}}/><canvas ref={canvas} aria-hidden="true"/></div>;
}

