import snapshot from './github-snapshot.json';
import {mapGithubProjects,githubUser} from './github-projects';
export let githubSync={state: 'snapshot',checkedAt: '',error: ''};
let cache=mapGithubProjects(snapshot),expires=0,pending:Promise<typeof cache>|null=null;
export async function getGithubProjects(){
 if(Date.now()<expires)return cache;if(pending)return pending;
 pending=(async()=>{try{
 const repos:unknown[]=[];
 for(let page=1;page<=10;page++){
 const response=await fetch(`https://api.github.com/users/${githubUser}/starred?per_page=100&sort=created&direction=desc&page=${page}`,{headers:{'Cache-Control':'no-cache',Accept:'application/vnd.github+json','User-Agent':'Alexillort-Portfolio'},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw new Error(`GitHub ${response.status}`);
 const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid GitHub response');repos.push(...data);
 if(data.length<100)break;if(page===10)throw new Error('GitHub pagination limit');
 }
 githubSync={state:'live',checkedAt:new Date().toISOString(),error:''};cache=mapGithubProjects(repos);expires=Date.now()+15*60*1000;
 }catch(error){githubSync={state:'fallback',checkedAt:new Date().toISOString(),error:error instanceof Error?error.message:'unavailable'};console.warn('GitHub refresh:',error instanceof Error?error.message:'unavailable');expires=Date.now()+60000;}return cache;})();
 try{return await pending;}finally{pending=null;}
}
