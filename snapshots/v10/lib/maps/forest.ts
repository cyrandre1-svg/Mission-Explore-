export const FOREST_WMS='https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi';
export type ForestCatalog={years:number[];program:string;stands:boolean;checked:string};
let cached:{until:number;value:ForestCatalog}|undefined;
export async function forestCatalog():Promise<ForestCatalog>{
 if(cached&&cached.until>Date.now())return cached.value;
 const r=await fetch(FOREST_WMS+'?SERVICE=WMS&REQUEST=GetCapabilities',{signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error('Catalogue MRNF indisponible');const xml=await r.text();
 const years=[...new Set([...xml.matchAll(/<Name>ca_interv_fores_(\d{4})<\/Name>/g)].map(m=>Number(m[1])))].sort((a,b)=>a-b);
 if(!years.length)throw Error('Aucune année publiée');
 const program=xml.match(/<Name>prana<\/Name>\s*<Title>([^<]+)<\/Title>/)?.[1]||'Programmation annuelle autorisée · exercice selon la fiche';
 const value={years,program,stands:xml.includes('<Name>ori_pee_close_scale</Name>'),checked:new Date().toISOString()};cached={until:Date.now()+21600000,value};return value;
}
export function forestPeriod(q:URLSearchParams){const start=Number(q.get('start')||2020),end=Number(q.get('end')||2026);if(![start,end].every(Number.isInteger)||start<1976||end>new Date().getUTCFullYear()||end<start||end-start>9)throw Error('Période invalide');return {start,end}}
export async function forestLayers(q:URLSearchParams){const kind=q.get('kind')||'cuts';if(kind==='stands')return {layers:['ori_pee_close_scale'],styles:[q.get('style')==='outline'?'Contour_sans_etiquette':'Couleur_sans_etiquette']};if(kind==='authorized')return {layers:['prana_sec_int'],styles:['default']};if(kind!=='cuts')throw Error('Couche invalide');const {start,end}=forestPeriod(q),catalog=await forestCatalog(),years=catalog.years.filter(y=>y>=start&&y<=end);return {layers:years.map(y=>'ca_interv_fores_'+y),styles:years.map(()=>'Couleur')}}
export function parseForestInfo(text:string){const features:{layer:string;id:string;properties:Record<string,string>}[]=[];let layer='',feature:typeof features[number]|undefined;
 for(const line of text.split('\n')){const l=line.match(/^Layer '([^']+)'/);if(l){layer=l[1];feature=undefined;continue}const f=line.match(/^\s*Feature ([^:]+):/);if(f){feature={layer,id:f[1],properties:{}};features.push(feature);continue}const p=line.match(/^\s+([\w:]+) = '(.*)'\s*$/);if(p&&feature&&p[2].trim())feature.properties[p[1]]=p[2].trim()}
 return features.slice(0,12);
}
