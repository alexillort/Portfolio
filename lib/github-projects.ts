import type {Project} from './content';
export const githubUser='alexillort';
export function mapGithubProjects(repos:unknown):Project[]{
 if(!Array.isArray(repos))throw new Error('Invalid GitHub response');
 return repos.filter(r=>r&&r.owner?.login?.toLowerCase()===githubUser&&!r.private&&typeof r.name==='string'&&/^[\w.-]+$/.test(r.name)).map(r=>{
 const terms=[r.name,...(Array.isArray(r.topics)?r.topics:[])].join(' ').toLowerCase();
 const category=/research|bibtex|emotion|hci|vtk/.test(terms)?'Research':/xr|vr|ar3d|quest|meta-homes/.test(terms)?'XR':/generative|3d|motion|animation/.test(terms)?'Motion':/ux|ui|design|portfolio|font/.test(terms)?'UX/UI':'Development';
 const fallback={es:'Repositorio público de '+githubUser+'.',en:'Public repository by '+githubUser+'.'};
 return {id:'github-'+r.id,title:r.name.replace(/[-_]/g,' '),category,image:'https://opengraph.githubassets.com/portfolio/'+githubUser+'/'+r.name,url:'https://github.com/'+githubUser+'/'+r.name,source:r.fork?'GitHub · Fork':'GitHub',description:{es:r.description||fallback.es,en:r.description||fallback.en}};
 });
}
