import fs from 'node:fs';
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';
import {gzipSync} from 'node:zlib';
const [input,out]=process.argv.slice(2),data=JSON.parse(fs.readFileSync(input,'utf8'));
const index=new geojsonvt(data,{maxZoom:14,indexMaxZoom:9,tolerance:1,extent:4096,buffer:64});
fs.mkdirSync(out,{recursive:true});let count=0;
function visit(z,x,y){
 const tile=index.getTile(z,x,y);if(!tile?.features.length)return;
 const features=tile.features.filter(f=>z>=13||['line',...(z>=12?['minor_line']:[])].includes(f.tags.kind));
 if(z>=8&&features.length){fs.writeFileSync(`${out}/${z}-${x}-${y}.pbf`,gzipSync(vtpbf.fromGeojsonVt({infrastructure:{...tile,features}})));count++;}
 if(z<14)for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)visit(z+1,x*2+dx,y*2+dy);
}
visit(0,0,0);
fs.writeFileSync(out+'/stats.json',JSON.stringify({...data.metadata,tiles:count},null,2));
console.log({features:data.features.length,tiles:count});
