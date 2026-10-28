import Portfolio from '../portfolio';
export default async function Page({searchParams}:{searchParams:Promise<{lang?:string}>}){ const query=await searchParams; return <Portfolio page="about" initialLang={query.lang==='en'?'en':'es'} />; }
