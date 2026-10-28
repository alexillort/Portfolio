'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Bot,CodeXml,Pause,Play} from 'lucide-react';

type Tool={id:string;name:string;image?:string;symbol?:'agents'|'code'};
const tool=(id:string,name:string,extension='svg'):Tool=>({id,name,image:`/images/tools/${id}.${extension}`});
// Keep every tool once in the accessible list. The second group is visual only.
const rows:Tool[][]=[
 [tool('chatgpt','ChatGPT'),tool('claude','Claude'),tool('gemini','Gemini'),tool('kimi','Kimi'),tool('deepseek','DeepSeek'),tool('perplexity','Perplexity'),tool('grok','Grok'),tool('copilot','Copilot'),tool('midjourney','Midjourney'),tool('runway','Runway'),tool('huggingface','Hugging Face'),{id:'agents',name:'AI agents',symbol:'agents'},tool('n8n','n8n')],
 [tool('figma','Figma'),tool('framer','Framer'),tool('canva','Canva'),tool('gamma','Gamma','png'),tool('illustrator','Illustrator','png'),tool('photoshop','Photoshop','png'),tool('after-effects','After Effects','png'),tool('jitter','Jitter','png'),tool('capcut','CapCut','ico'),tool('premiere','Premiere Pro','png'),tool('audition','Audition','png'),tool('lightroom','Lightroom','png'),tool('indesign','InDesign','png')],
 [tool('unreal','Unreal Engine'),tool('unity','Unity','png'),tool('blender','Blender'),tool('maya','Maya','png'),tool('meta','Meta','png'),{id:'code',name:'Code',symbol:'code'},tool('vscode','VS Code'),tool('cursor','Cursor'),tool('github','GitHub'),tool('gitlab','GitLab'),tool('git','Git'),tool('python','Python'),tool('react','React')],
 [tool('google','Google'),tool('microsoft','Microsoft'),{id:'workspace',name:'Google Workspace',image:'/images/tools/google.svg'},tool('tableau','Tableau'),tool('powerbi','Power BI'),tool('clickup','ClickUp'),tool('notion','Notion'),tool('slack','Slack'),tool('html','HTML5','png'),tool('css','CSS3','png'),tool('javascript','JavaScript','png'),tool('xd','Adobe XD','png')]
];

export function Toolbox({lang,paused}:{lang:'es'|'en';paused:boolean}){
 const es=lang==='es',section=useRef<HTMLElement>(null);
 const [playing,setPlaying]=useState(true),[inView,setInView]=useState(false),[visible,setVisible]=useState(true),[reduced,setReduced]=useState(true);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const motion=()=>setReduced(media.matches),visibility=()=>setVisible(!document.hidden);
  motion();visibility();media.addEventListener('change',motion);document.addEventListener('visibilitychange',visibility);
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{rootMargin:'80px'});
  if(section.current)observer.observe(section.current);
  return()=>{observer.disconnect();media.removeEventListener('change',motion);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const staticMode=paused||reduced||!playing,running=!staticMode&&inView&&visible;
 const card=(item:Tool,duplicate:boolean)=>{
  const name=item.id==='agents'?(es?'Agentes de IA':'AI agents'):item.id==='code'?(es?'Código':'Code'):item.name;
  return <li className="tool-chip" key={item.id} data-tool={duplicate?undefined:item.id}>
   {item.image?<img src={item.image} alt="" width="44" height="44" loading="lazy" draggable={false}/>:item.symbol==='agents'?<Bot aria-hidden="true"/>:<CodeXml aria-hidden="true"/>}
   <span>{name}</span>
  </li>;
 };
 return <section id="tools" ref={section} className="toolbox-section" data-static={staticMode} data-running={running}>
  <div className="toolbox-heading"><div><span className="eyebrow">{es?'MI CAJA DE HERRAMIENTAS':'MY TOOLBOX'}</span><h2>Ideas,<br/><strong>{es?'bien equipadas.':'well equipped.'}</strong></h2></div><div className="toolbox-aside"><p>{es?'Para diseñar, prototipar, crear mundos y darles movimiento. Las herramientas cambian; la curiosidad se queda.':'To design, prototype, build worlds and bring them to life. The tools change; curiosity stays.'}</p><button className="toolbox-toggle glass" onClick={()=>setPlaying(!playing)} aria-pressed={!playing} disabled={paused||reduced} aria-label={es?(playing?'Pausar herramientas':'Animar herramientas'):(playing?'Pause tools':'Animate tools')}>{playing?<Pause size={15}/>:<Play size={15}/>}<span>{es?(playing?'Pausar':'Animar'):(playing?'Pause':'Animate')}</span></button></div></div>
  <div className="toolbox-ribbons">{rows.map((row,index)=><div className="toolbox-lane" key={index} tabIndex={0} role="region" aria-label={(es?'Herramientas, fila ':'Tools, row ')+(index+1)} style={{'--belt-duration':`${52+index*5}s`,'--belt-delay':`${-index*7}s`} as CSSProperties}><div className="tools-belt"><ul className="tools-group">{row.map(item=>card(item,false))}</ul><ul className="tools-group tools-clone" aria-hidden="true">{row.map(item=>card(item,true))}</ul></div></div>)}</div>
 </section>;
}
