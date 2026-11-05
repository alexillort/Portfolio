'use client';
import {useEffect,useRef} from 'react';

// One small WebGL lens; the photo remains available when motion or WebGL is off.
export function PortraitSphere({paused}:{paused:boolean}){
 const root=useRef<HTMLDivElement>(null),canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=root.current,c=canvas.current;if(!el||!c)return;
  const motion=matchMedia('(prefers-reduced-motion:reduce)');
  let dispose=()=>{};
  const setup=()=>{
   dispose();el.classList.remove('sphere-ready');if(paused||motion.matches)return;
   const gl=c.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return;
   const shaders:WebGLShader[]=[];
   const shader=(kind:number,source:string)=>{const s=gl.createShader(kind);if(!s)return null;gl.shaderSource(s,source);gl.compileShader(s);shaders.push(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
   const vs=shader(gl.VERTEX_SHADER,'attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}');
   const fs=shader(gl.FRAGMENT_SHADER,`
    precision mediump float;
    varying vec2 uv;
    uniform sampler2D photo;
    uniform vec2 pointer;
    uniform vec2 crop;
    uniform float time;
    void main(){
     vec2 p=(uv-.5)*2.;float r=length(p);if(r>1.)discard;
     float z=sqrt(max(0.,1.-r*r));vec3 normal=vec3(p,z);
     // Compression grows towards the edge, like an image inside a glass sphere.
     vec2 lens=p*(.65+.35*z);
     vec2 st=.5+(lens*.5+pointer*.035*z)*crop;
     vec3 color=texture2D(photo,st).rgb;
     float fresnel=pow(1.-z,2.5);
     vec3 sheen=.55+.45*cos(vec3(0.,2.,4.)+atan(p.y,p.x)*1.6+time*.18);
     color=mix(color,sheen,fresnel*.65);
     vec3 light=normalize(vec3(-.5+pointer.x*.3,.65+pointer.y*.3,1.1));
     float highlight=pow(max(dot(normal,light),0.),55.);
     color+=vec3(.8,.92,1.)*highlight*.55;
     color+=vec3(.5,.72,1.)*pow(max(dot(normal,normalize(vec3(.7,-.6,.2))),0.),28.)*.5;
     color*=.88+.12*z;
     float edge=smoothstep(.94,.985,r)*(1.-smoothstep(.99,1.,r));
     color+=sheen*edge*.35;
     gl_FragColor=vec4(color,1.-smoothstep(.994,1.,r));
    }`);
   const program=gl.createProgram();if(!program||!vs||!fs){shaders.forEach(s=>gl.deleteShader(s));return;}
   gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS)){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);return;}
   gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   const pointer=gl.getUniformLocation(program,'pointer'),time=gl.getUniformLocation(program,'time'),crop=gl.getUniformLocation(program,'crop');
   let frame=0,active=false,loaded=false,closed=false,last=0,x=0,y=0,tx=0,ty=0;
   const draw=(now:number)=>{
    frame=0;if(closed||!active||document.hidden||!loaded)return;
    if(now-last>30){last=now;x+=(tx-x)*.1;y+=(ty-y)*.1;gl.uniform2f(pointer,x,y);gl.uniform1f(time,now/1000);gl.drawArrays(gl.TRIANGLES,0,6);el.style.setProperty('--lens-x',`${x*7}px`);el.style.setProperty('--lens-y',`${-y*7}px`);}
    frame=requestAnimationFrame(draw);
   };
   const request=()=>{if(!frame&&!closed)frame=requestAnimationFrame(draw);};
   const resize=()=>{const size=Math.round(el.clientWidth*.76*Math.min(devicePixelRatio,2));c.width=size;c.height=size;gl.viewport(0,0,size,size);request();};
   const image=new Image();image.onload=()=>{if(closed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);const aspect=image.naturalWidth/image.naturalHeight;gl.uniform2f(crop,Math.min(1,1/aspect),Math.min(1,aspect));loaded=true;resize();el.classList.add('sphere-ready');request();};image.src='/images/portrait.jpg';
   const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,1-(e.clientY-r.top)/r.height*2));request();};
   const leave=()=>{tx=0;ty=0;};
   const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;request();});observer.observe(el);
   const sizes=new ResizeObserver(resize);sizes.observe(el);
   const lost=(event:Event)=>{event.preventDefault();el.classList.remove('sphere-ready');loaded=false;cancelAnimationFrame(frame);frame=0;};
   el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',request);c.addEventListener('webglcontextlost',lost);
   dispose=()=>{closed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',request);c.removeEventListener('webglcontextlost',lost);image.onload=null;gl.deleteBuffer(buffer);gl.deleteTexture(texture);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));el.classList.remove('sphere-ready');el.style.removeProperty('--lens-x');el.style.removeProperty('--lens-y');};
  };
  setup();motion.addEventListener('change',setup);return()=>{dispose();motion.removeEventListener('change',setup);};
 },[paused]);
 return <div ref={root} className="portrait-orbit portrait-sphere"><svg viewBox="0 0 240 240" aria-hidden="true"><defs><path id="portrait-circle" d="M120,120 m-107,0 a107,107 0 1,1 214,0 a107,107 0 1,1 -214,0"/></defs><text><textPath href="#portrait-circle" textLength="671">VR / AR / XR CREATOR ✦ ENGINEER ✦ UX / UI DESIGNER ✦ </textPath></text></svg><div className="portrait-lens"><img src="/images/portrait.jpg" alt="Alexander Rozo Torres" fetchPriority="high"/><canvas ref={canvas} aria-hidden="true"/><span className="lens-glint" aria-hidden="true"/></div></div>;
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
  const media=matchMedia('(prefers-reduced-motion:reduce)');let frame=0,active=false,last=0;
  const lines=Array.from(el.querySelectorAll<HTMLElement>('.area-line')).map((line,i)=>({line,i,x:0,y:0,px:0,py:0,hover:false,words:Array.from(line.querySelectorAll<HTMLElement>('.area-word'))}));
  const disabled=()=>paused||media.matches;
  const clear=()=>{el.style.setProperty('--area-shift','0px');lines.forEach(({line,words})=>{line.style.removeProperty('--pointer-x');line.style.removeProperty('--pointer-y');words.forEach(word=>{word.style.removeProperty('transform');word.style.removeProperty('color');});});};
  const draw=(now:number)=>{
   frame=0;if(disabled()){clear();return;}if(!active||document.hidden)return;
   if(now-last>25){last=now;const r=el.getBoundingClientRect(),progress=(innerHeight*.5-r.top-r.height*.5)/(innerHeight+r.height);el.style.setProperty('--area-shift',`${Math.max(-1,Math.min(1,progress))*Math.min(innerWidth*.48,550)}px`);
    lines.forEach(s=>{
     const box=s.line.getBoundingClientRect();if(box.bottom<0||box.top>innerHeight)return;
     const tx=s.hover?s.px:Math.sin(now/1900+s.i*1.8)*Math.min(innerWidth*.17,200),ty=s.hover?s.py:Math.cos(now/1500+s.i)*12;
     s.x+=(tx-s.x)*.12;s.y+=(ty-s.y)*.12;s.line.style.setProperty('--pointer-x',`${s.x}px`);s.line.style.setProperty('--pointer-y',`${s.y}px`);
     const cx=box.left+box.width*.5+s.x,cy=box.bottom-16+s.y;
     s.words.forEach(word=>{const b=word.getBoundingClientRect();const dx=Math.max(b.left-cx,0,cx-b.right),dy=b.top+b.height*.5-cy;const influence=Math.max(0,1-Math.hypot(dx,dy)/160);word.style.transform=`translateY(${-influence*9}px) scale(${1+influence*.035})`;word.style.color=influence>.55?'var(--area-ink)':'';});
    });
   }
   frame=requestAnimationFrame(draw);
  };
  const request=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const listeners=lines.map(s=>{
   const move=(e:PointerEvent)=>{const b=s.line.getBoundingClientRect();s.hover=true;s.px=e.clientX-b.left-b.width*.5;s.py=e.clientY-b.bottom+16;request();};
   const leave=()=>{s.hover=false;};s.line.addEventListener('pointermove',move);s.line.addEventListener('pointerleave',leave);return()=>{s.line.removeEventListener('pointermove',move);s.line.removeEventListener('pointerleave',leave);};
  });
  const observer=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;request();});observer.observe(el);media.addEventListener('change',request);document.addEventListener('visibilitychange',request);request();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();listeners.forEach(remove=>remove());media.removeEventListener('change',request);document.removeEventListener('visibilitychange',request);clear();};
 },[paused,lang]);
 return <section ref={root} className="scroll-areas interactive-areas" id="areas" aria-label={lang==='es'?'Mis áreas creativas':'My creative fields'}><span className="eyebrow">{lang==='es'?'DISTINTAS MIRADAS. UNA MISMA CURIOSIDAD.':'DIFFERENT PERSPECTIVES. THE SAME CURIOSITY.'}</span>{rows.map((words,i)=>{
  const content=words.map((word,j)=><span key={word}><span className="area-word">{word}</span>{j<words.length-1&&<span className="area-separator"> · </span>}</span>);
  return <div className={`area-line area-line-${i}`} key={i}><div className="area-track"><span className="area-repeat" aria-hidden="true">{content} ✦</span><h2>{content}</h2><span className="area-repeat" aria-hidden="true">✦ {content}</span></div><span className="area-pointer" aria-hidden="true"><svg viewBox="0 0 20 24"><path d="M1 1L17 12 9 14 6 22Z"/></svg><i/></span></div>;
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
