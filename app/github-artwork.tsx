'use client';
import {Code2,GitBranch,Box,Orbit,Sparkles} from 'lucide-react';
import type {Project} from '../lib/content';
export function GithubArtwork({project}:{project:Project}){
 const seed=Array.from(project.id).reduce((n,c)=>n+c.charCodeAt(0),0)%5;
 const Icon=[Code2,GitBranch,Box,Orbit,Sparkles][seed];
 return <div className={`github-artwork github-tone-${seed}`} aria-hidden="true"><div className="github-halo"/><div className="github-orbits"><i/><i/><i/></div><span className="github-art-label">{project.category}</span><Icon className="github-art-icon" strokeWidth={.8}/><div className="github-art-title">{project.title}</div></div>;
}
