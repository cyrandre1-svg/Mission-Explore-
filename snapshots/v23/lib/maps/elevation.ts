import {MAP_BOUNDS} from './region';
import {fromArrayBuffer} from 'geotiff';
export const TILE_SIZE=512;
export function tileBounds(z:number,x:number,y:number){const edge=20037508.342789244,span=2*edge/2**z;return [-edge+x*span,edge-(y+1)*span,-edge+(x+1)*span,edge-y*span] as const;}
export function validTile(z:number,x:number,y:number,min=12,max=16){return [z,x,y].every(Number.isInteger)&&z>=min&&z<=max&&x>=0&&y>=0&&x<2**z&&y<2**z;}
export function inRegion(z:number,x:number,y:number){const n=2**z,west=x/n*360-180,east=(x+1)/n*360-180,north=Math.atan(Math.sinh(Math.PI*(1-2*y/n)))*180/Math.PI,south=Math.atan(Math.sinh(Math.PI*(1-2*(y+1)/n)))*180/Math.PI;return east>=MAP_BOUNDS[0]&&west<=MAP_BOUNDS[2]&&north>=MAP_BOUNDS[1]&&south<=MAP_BOUNDS[3];}
export function coverageUrl(z:number,x:number,y:number){const [w,s,e,n]=tileBounds(z,x,y),res=(e-w)/TILE_SIZE,pad=3*res;
const params=new URLSearchParams({SERVICE:'WCS',VERSION:'1.1.1',REQUEST:'GetCoverage',FORMAT:'image/geotiff',IDENTIFIER:'dtm',BOUNDINGBOX:`${w-pad},${s-pad},${e+pad},${n+pad},urn:ogc:def:crs:EPSG::3857`,GRIDBASECRS:'urn:ogc:def:crs:EPSG::3857',GRIDOFFSETS:`${res},${-res}`,GRIDORIGIN:`${w-pad},${n+pad}`,INTERPOLATION:'bilinear'});
return 'https://datacube.services.geo.ca/ows/elevation?'+params;
}
function crc32(a:Uint8Array){let c=0xffffffff;for(const b of a){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0;}
function chunk(name:string,data:Uint8Array){const b=new Uint8Array(data.length+12),v=new DataView(b.buffer);v.setUint32(0,data.length);b.set(new TextEncoder().encode(name),4);b.set(data,8);v.setUint32(b.length-4,crc32(b.subarray(4,b.length-4)));return b;}
export async function rgbaPNG(width:number,height:number,rgba:Uint8Array){const raw=new Uint8Array(height*(width*4+1));for(let y=0;y<height;y++)raw.set(rgba.subarray(y*width*4,(y+1)*width*4),y*(width*4+1)+1);
const compressed=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());const ihdr=new Uint8Array(13),dv=new DataView(ihdr.buffer);dv.setUint32(0,width);dv.setUint32(4,height);ihdr[8]=8;ihdr[9]=6;const parts=[new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',compressed),chunk('IEND',new Uint8Array())],png=new Uint8Array(parts.reduce((a,b)=>a+b.length,0));let at=0;for(const p of parts){png.set(p,at);at+=p.length}return png;}
export async function convertElevation(tiffBuffer:ArrayBuffer,z:number,x:number,y:number){const tiff=await fromArrayBuffer(tiffBuffer),im=await tiff.getImage(),width=im.getWidth(),height=im.getHeight();if(width>2048||height>2048||im.getSamplesPerPixel()!==1)throw Error('Grille inattendue');const values=(await im.readRasters({samples:[0]}))[0] as ArrayLike<number>;const origin=im.getOrigin(),resolution=im.getResolution(),nodata=im.getGDALNoData();if(!(resolution[0]>0&&resolution[1]<0))throw Error('Orientation inattendue');const [w,s,e,n]=tileBounds(z,x,y),step=(e-w)/TILE_SIZE,rgba=new Uint8Array(TILE_SIZE*TILE_SIZE*4);let valid=0,min=Infinity,max=-Infinity;
for(let row=0;row<TILE_SIZE;row++)for(let col=0;col<TILE_SIZE;col++){
 const fx=(w+(col+.5)*step-origin[0])/resolution[0]-.5,fy=(n-(row+.5)*step-origin[1])/resolution[1]-.5,ix=Math.floor(fx),iy=Math.floor(fy);if(ix<0||iy<0||ix+1>=width||iy+1>=height)continue;
 const a=Number(values[iy*width+ix]),b=Number(values[iy*width+ix+1]),c=Number(values[(iy+1)*width+ix]),d=Number(values[(iy+1)*width+ix+1]);if([a,b,c,d].some(v=>!Number.isFinite(v)||v===nodata||v< -500||v>4000))continue;
 const dx=fx-ix,dy=fy-iy,h=(a*(1-dx)+b*dx)*(1-dy)+(c*(1-dx)+d*dx)*dy,code=Math.round((h+32768)*256),at=(row*TILE_SIZE+col)*4;
 rgba[at]=(code>>>16)&255;rgba[at+1]=(code>>>8)&255;rgba[at+2]=code&255;rgba[at+3]=255;valid++;min=Math.min(min,h);max=Math.max(max,h);
}
return {png:await rgbaPNG(TILE_SIZE,TILE_SIZE,rgba),valid,total:TILE_SIZE*TILE_SIZE,min,max};}
