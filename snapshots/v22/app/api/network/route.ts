import {validBBox} from '../../../lib/maps/region';
const layers:Record<string,{id:number,name:string}>={multi:{id:37,name:'Chemins multiusages'},sepaq:{id:107,name:'Réseau Sépaq'},cycling:{id:15,name:'Route verte'},quad:{id:116,name:'Sentiers quad'},snow:{id:113,name:'Sentiers motoneige'}};
export async function GET(request:Request){const p=new URL(request.url).searchParams,kind=p.get('kind')||'',bbox=(p.get('bbox')||'').split(',').map(Number),layer=layers[kind];if(!layer||bbox.length!==4||bbox.some(n=>!Number.isFinite(n)))return new Response('Paramètres invalides',{status:400});const [w,s,e,n]=bbox;if(!validBBox(bbox,.8))return new Response('Zoomez davantage dans le territoire Québec',{status:400});
const features:any[]=[],seen=new Set<string>();let partial=false;
try{for(let page=0;page<3;page++){
 const query=new URLSearchParams({f:'geojson',where:'1=1',geometry:bbox.join(','),geometryType:'esriGeometryEnvelope',inSR:'4326',spatialRel:'esriSpatialRelIntersects',outSR:'4326',outFields:'*',geometryPrecision:'6',resultRecordCount:'2000',resultOffset:String(page*2000),orderByFields:'OBJECTID ASC'});
 const r=await fetch(`https://servicescarto.mrnf.gouv.qc.ca/pes/rest/services/Territoire/AQreseauPlus_WMS/MapServer/${layer.id}/query?${query}`,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('upstream');const data=await r.json() as any;if(data.error||!Array.isArray(data.features))throw Error('upstream');for(const f of data.features){const props=f.properties||{},id=String(props.AQRP_UUID||props.OBJECTID||JSON.stringify(f.geometry));if(!seen.has(id)){seen.add(id);features.push({type:'Feature',geometry:f.geometry,properties:{...props,mission_source:'AQréseau+',mission_kind:kind}})}}
 if(data.features.length<2000&&!data.exceededTransferLimit)break;if(page===2)partial=true;
 }
 return Response.json({type:'FeatureCollection',features,metadata:{source:'MRNF / AQréseau+',kind,label:layer.name,partial}},{headers:{'Cache-Control':'public, max-age=86400'}});
}catch{return Response.json({error:'Service AQréseau+ indisponible. Réessayez dans quelques instants.'},{status:502});}}
