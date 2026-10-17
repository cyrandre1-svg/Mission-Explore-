import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Mission Explore | Québec',description:'Explorez le relief, les sentiers et vos parcours. Cartographie plein air du Québec par Mission.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body style={{margin:0}}>{children}</body></html>}
