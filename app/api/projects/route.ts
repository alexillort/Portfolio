import {githubSync} from '../../../lib/github-feed';
import {getProjects} from '../../../lib/feeds';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({...await getProjects(),githubSync},{headers:{'Cache-Control':'no-store'}});}
