import {MAP_BOUNDS} from '../../../lib/maps/region';
const layers = new Set(['courbes_niveau_5m','courbes_niveau_10m','lidar_ombre']);
export async function GET(request: Request) {
 const p=new URL(request.url).searchParams;
 const layer=p.get('layer')||''; const z=Number(p.get('z')), x=Number(p.get('x')), y=Number(p.get('y'));
 if(!layers.has(layer)||![z,x,y].every(Number.isInteger)||z<7||z>18||x<0||y<0||x>=2**z||y>=2**z)return new Response('Paramètres invalides',{status:400});
 const edge=20037508.342789244, span=2*edge/2**z;
 const bbox=[-edge+x*span,edge-(y+1)*span,-edge+(x+1)*span,edge-y*span];
 const west=x/2**z*360-180, east=(x+1)/2**z*360-180;
 const north=Math.atan(Math.sinh(Math.PI*(1-2*y/2**z)))*180/Math.PI;
 const south=Math.atan(Math.sinh(Math.PI*(1-2*(y+1)/2**z)))*180/Math.PI;
 if(east < MAP_BOUNDS[0] || west > MAP_BOUNDS[2] || north < MAP_BOUNDS[1] || south > MAP_BOUNDS[3]) return new Response('Hors du territoire Québec',{status:404});
 const url=new URL('https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi');
 url.search=new URLSearchParams({SERVICE:'WMS',VERSION:'1.1.1',REQUEST:'GetMap',LAYERS:layer,STYLES:'',FORMAT:'image/png',TRANSPARENT:'TRUE',SRS:'EPSG:3857',BBOX:bbox.join(','),WIDTH:'512',HEIGHT:'512'}).toString();
 try {
  const response=await fetch(url.toString(),{signal:AbortSignal.timeout(25000)});
  if(!response.ok||!response.headers.get('content-type')?.includes('image/png'))return new Response('Service LiDAR indisponible',{status:502});
  return new Response(response.body,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400','X-Data-Source':'MRNF Quebec CC-BY-4.0'}});
 } catch {return new Response('Délai du service LiDAR dépassé',{status:504});}
}
