import type { Metadata } from 'next';
import './globals.css';
import './motion-revision.css';
import './glass-revision.css';
import ExperienceMotion from './experience-motion';
export const metadata: Metadata = {
 title: '.ART — Alexander Rozo Torres',
 description: 'Diseño que se siente. Alexander Rozo Torres: UX/UI, ingeniería multimedia, experiencias inmersivas e investigación.',
 metadataBase: new URL('https://alexillort-art.miunidad21.chatgpt.site'),
 openGraph: {title: '.ART — Alexander Rozo Torres', description: 'Design. Explore. Feel. Digital and immersive experiences.', images: ['/images/siggraph.png'], type: 'website'},
 icons: {icon: '/favicon.svg'},
};
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="es"><body><ExperienceMotion/>{children}</body></html>; }

