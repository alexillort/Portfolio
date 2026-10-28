import {getProjects} from '../../../lib/feeds';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(await getProjects(),{headers:{'Cache-Control':'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'}});}
