// Bounded-memory provincial tiling. Every output tile belongs to one z7 bucket.
import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import GeoJSONVT from 'geojson-vt';
import vtpbf from 'vt-pbf';
import {gzipSync} from 'node:zlib';
const [input,out,kind='trails']=process.argv.slice(2),bucketDir=out+'-buckets',layer=kind==='trails'?'mission_trails':'infrastructure';
if((fs.existsSync(out)&&fs.readdirSync(out).length)||(fs.existsSync(bucketDir)&&fs.readdirSync(bucketDir).length))throw Error('Use empty output and bucket directories to avoid stale tiles.');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(bucketDir,{recursive:true});
const handles=new Map(),counts={},imba={},classes={};let features=0,privateCount=0;
const tx=lon=>Math.floor((lon+180)/360*128),ty=lat=>Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*128);
const lines=kind==='trails'?readline.createInterface({input:fs.createReadStream(input),crlfDelay:Infinity}):JSON.parse(fs.readFileSync(input,'utf8')).features.map(f=>JSON.stringify(f));
for await(const line of lines){if(!line.trim())continue;const f=JSON.parse(line),p=f.properties;f.properties=Object.fromEntries(Object.entries(p).filter(([,v])=>v!==''&&v!==false&&v!==null));if(kind==='trails')delete f.id;const coords=f.geometry.type==='Point'?[f.geometry.coordinates]:f.geometry.coordinates;
 let w=Infinity,e=-Infinity,s=Infinity,n=-Infinity;for(const c of coords){w=Math.min(w,c[0]);e=Math.max(e,c[0]);s=Math.min(s,c[1]);n=Math.max(n,c[1]);}
 // z8 buffer is <0.023 degrees in longitude, less in latitude.
 for(let x=tx(w-.03);x<=tx(e+.03);x++)for(let y=ty(n+.03);y<=ty(s-.03);y++){const key=x+'-'+y;if(!handles.has(key))handles.set(key,fs.openSync(path.join(bucketDir,key+'.seq'),'w'));fs.writeSync(handles.get(key),JSON.stringify(f)+'\n');}
 features++;counts[p.kind]=(counts[p.kind]||0)+1;imba[p.difficulty]=(imba[p.difficulty]||0)+1;classes[p.trail_class]=(classes[p.trail_class]||0)+1;if([p.access,p.bicycle,p.foot].includes('private'))privateCount++;
}
for(const fd of handles.values())fs.closeSync(fd);
let count=0;
for(const filename of fs.readdirSync(bucketDir)){
 const [x,y]=filename.split('.')[0].split('-').map(Number),items=fs.readFileSync(path.join(bucketDir,filename),'utf8').trim().split('\n').map(s=>JSON.parse(s));
 const index=new GeoJSONVT({type:'FeatureCollection',features:items},{maxZoom:14,indexMaxZoom:7,tolerance:1,extent:4096,buffer:64});
 function visit(z,x,y){const tile=index.getTile(z,x,y);if(!tile)return;const rendered=kind==='trails'?tile.features.filter(f=>z>=10||f.tags.route_mtb||f.tags.route_bicycle||f.tags.route_hiking):tile.features.filter(f=>z>=13||['line',...(z>=12?['minor_line']:[])].includes(f.tags.kind));if(z>=8&&rendered.length){fs.writeFileSync(`${out}/${z}-${x}-${y}.pbf`,gzipSync(vtpbf.fromGeojsonVt({[layer]:{...tile,features:rendered}})));count++;}if(z<14)for(let a=0;a<2;a++)for(let b=0;b<2;b++)visit(z+1,x*2+a,y*2+b);}
 visit(7,x,y);console.log(filename,items.length,'features;',count,'tiles');
}
const stats={generated_at:new Date().toISOString(),features,tiles:count,bounds:[-80,44.9,-57,62.7],layer,source:'© OpenStreetMap contributors · ODbL / extrait Geofabrik Québec',source_url:'https://download.geofabrik.de/north-america/canada/quebec-latest.osm.pbf',...(kind==='trails'?{imba,classes,private:privateCount}:{counts})};
fs.writeFileSync(out+'/stats.json',JSON.stringify(stats,null,2));console.log(stats);
