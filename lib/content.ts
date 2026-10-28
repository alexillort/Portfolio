export type Project = {id:string; title:string; category:string; image:string; url?:string; description:{es:string;en:string}; source?:string};
export type Publication = {id:string; title:string; authors:string; venue:string; year:number; url:string; source:string};
export const profile = {
 name:'Alexander Rozo Torres', email:'alexrozzo.arz@gmail.com', phone:'+573143852131',
 behance:'https://www.behance.net/alexrozzo', scholar:'https://scholar.google.com/citations?user=SPK8iKAAAAAJ',
 orcid:'0000-0001-9343-2264', resume:'https://drive.google.com/file/d/1nBcUADWPP1zYxyE0qcMaNErWCbn01Ew6/view',
};
// Editorial allowlist. Only these IDs are public. Feed updates enrich the
// selection but do not add projects without an editorial decision.
export const projects:Project[] = [
 {id:'siggraph',title:'Bogotá ACM SIGGRAPH',category:'UX/UI',image:'/images/siggraph.png',url:'https://www.behance.net/gallery/108409107/Bogota-ACM-SIGGRAPH-Transformando-La-Experiencia-Web',description:{es:'Transformando la experiencia web de Bogotá ACM SIGGRAPH.',en:'Transforming the Bogotá ACM SIGGRAPH web experience.'}},
 {id:'fundome',title:'FunDome',category:'Design',image:'/images/fundome.png',description:{es:'Una exploración visual de juego, color y nuevas experiencias.',en:'A visual exploration of play, color and new experiences.'}},
 {id:'funline',title:'FunLine',category:'UX/UI',image:'/images/funline.png',url:'https://www.behance.net/gallery/119007395/FunLine-Have-fun-while-you-wait',description:{es:'Divertirse mientras esperas. Diseño para transformar los tiempos de espera.',en:'Have fun while you wait. Design to transform waiting time.'}},
 {id:'emotional',title:'Emotional Mapping Terms',category:'Research',image:'/images/emotional.png',description:{es:'Una exploración de las emociones en el diseño de experiencias.',en:'Exploring emotions in experience design.'}},
 {id:'imaginatio',title:'Sequence Imaginatio XII — UMNG',category:'Motion',image:'/images/imaginatio.png',url:'https://www.behance.net/gallery/112688109/Sequence-for-the-Video-Clip-to-Imaginatio-XII-UMNG',description:{es:'Secuencia para el videoclip de Imaginatio XII.',en:'A sequence for the Imaginatio XII video clip.'}},
 {id:'exploratorium',title:'Exploratorium',category:'Design',image:'/images/exploratorium.png',url:'https://www.behance.net/gallery/108247581/Exploratorium',description:{es:'Una invitación visual a explorar y descubrir.',en:'A visual invitation to explore and discover.'}},
 {id:'fernweh',title:'Fernweh',category:'Design',image:'/images/fernweh.png',description:{es:'Una exploración visual del deseo de descubrir otros lugares.',en:'A visual exploration of the desire to discover new places.'}},
 {id:'gloves',title:'Gloves',category:'Research',image:'/images/gloves.png',description:{es:'Experimentación en la intersección de lo físico y lo digital.',en:'Experimentation at the intersection of the physical and digital.'}},
];

