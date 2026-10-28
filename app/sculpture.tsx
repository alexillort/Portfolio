'use client';
import {useEffect,useRef,useState} from 'react';
const vertex=`attribute vec2 position; void main(){ gl_Position=vec4(position,0.,1.); }`;
const fragment=`precision highp float;
uniform vec2 resolution; uniform vec2 pointer; uniform float time;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float shape(vec3 p){
 p.xz*=rot(time*.16+pointer.x*.35);p.xy*=rot(.62+pointer.y*.25);
 p.yz*=rot(.8); float a=atan(p.y,p.x);float radius=1.05+.12*cos(a*3.+time*.25);
 vec2 q=vec2(length(p.xy)-radius,p.z);q*=rot(a*1.5+time*.14);
 return (pow(pow(abs(q.x),3.)+pow(abs(q.y),3.),1./3.)-.39)*.75;
}
vec3 normal(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-resolution)/min(resolution.x,resolution.y);
 vec3 ro=vec3(0.,0.,4.6),rd=normalize(vec3(uv,-3.));float d=0.;bool hit=false;
 for(int i=0;i<80;i++){float h=shape(ro+rd*d);if(h<.002){hit=true;break;}d+=h;if(d>9.)break;}
 if(!hit){gl_FragColor=vec4(0.);return;}
 vec3 p=ro+rd*d,n=normal(p),r=reflect(rd,n);
 float diffuse=max(dot(n,normalize(vec3(-2.,3.,4.))),0.);
 float spec=pow(max(dot(r,normalize(vec3(-1.,2.,3.))),0.),35.);
 float fres=pow(1.-max(dot(-rd,n),0.),2.);
 vec3 lilac=vec3(.52,.31,.85),pink=vec3(.96,.72,.84),silver=vec3(.83,.88,.92);
 vec3 color=mix(lilac,silver,smoothstep(-.3,.5,r.y));
 color=mix(color,pink,smoothstep(.1,.8,sin(r.x*5.+r.z*3.))*.6);
 float stripe=smoothstep(.08,.13,abs(sin(r.y*3.+r.x*2.)));
 color*=.33+.67*stripe; color*=.5+.6*diffuse; color+=spec*.9+fres*.22;
 gl_FragColor=vec4(pow(color,vec3(.9)),1.);
}`;
export default function Sculpture({paused,lang}:{paused:boolean;lang:'es'|'en'}) {
 const ref=useRef<HTMLCanvasElement>(null);const [ok,setOk]=useState(true);
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){setOk(false);return;}
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);return shader;};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);const program=gl.createProgram()!;
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){setOk(false);return;}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const res=gl.getUniformLocation(program,'resolution'),ptr=gl.getUniformLocation(program,'pointer'),t=gl.getUniformLocation(program,'time');let frame=0;let visible=true;let x=0,y=0;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resize=()=>{const box=canvas.getBoundingClientRect();const ratio=Math.min(devicePixelRatio,1.5);canvas.width=box.width*ratio;canvas.height=box.height*ratio;gl.viewport(0,0,canvas.width,canvas.height);};
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;});intersection.observe(canvas);
  const move=(e:PointerEvent)=>{const box=canvas.getBoundingClientRect();x=(e.clientX-box.left)/box.width-.5;y=(e.clientY-box.top)/box.height-.5;};canvas.addEventListener('pointermove',move);
  const render=(now:number)=>{if(visible&&!document.hidden){gl.uniform2f(res,canvas.width,canvas.height);gl.uniform2f(ptr,x,y);gl.uniform1f(t,reduced||paused?3:now*.001);gl.drawArrays(gl.TRIANGLES,0,6);}frame=requestAnimationFrame(render);};resize();frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();canvas.removeEventListener('pointermove',move);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);};
 },[paused]);
 return <div className="sculpture"><div className="sculpture-glow"/><canvas ref={ref} aria-label={lang==='es'?'Escultura digital iridiscente interactiva':'Interactive iridescent digital sculpture'} role="img"/>{!ok&&<div className="sculpture-fallback"/>}<div className="sculpture-shadow"/></div>;
}

