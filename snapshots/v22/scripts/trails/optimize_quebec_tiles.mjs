// Compact existing trail tiles without changing their integer geometries.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import vtpbf from 'vt-pbf';
const dependencies=createRequire(import.meta.resolve('vt-pbf')),VectorTile=dependencies('@mapbox/vector-tile').VectorTile,Pbf=dependencies('pbf');
const [input,output]=process.argv.slice(2);
if(fs.existsSync(output)&&fs.readdirSync(output).length)throw Error('Use an empty output directory.');fs.mkdirSync(output,{recursive:true});
let count=0,checked=0;
for(const name of fs.readdirSync(input).filter(n=>n.endsWith('.pbf'))){
 const z=parseInt(name),tile=new VectorTile(new Pbf(gunzipSync(fs.readFileSync(input+'/'+name))));let kept=0;
 for(const layer of Object.values(tile.layers)){
  const features=[];for(let i=0;i<layer.length;i++){const feature=layer.feature(i);if(z<10&&!feature.properties.route_mtb&&!feature.properties.route_bicycle&&!feature.properties.route_hiking)continue;feature.properties=Object.fromEntries(Object.entries(feature.properties).filter(([,value])=>value!==''&&value!==false&&value!==null));feature.id=undefined;features.push(feature)}
  layer.length=features.length;layer.feature=i=>features[i];kept+=features.length;
 }
 if(!kept)continue;const binary=vtpbf.fromVectorTileJs(tile);
 if(count%1000===0){const roundtrip=new VectorTile(new Pbf(binary)),first=tile.layers.mission_trails.feature(0);assert.deepEqual(roundtrip.layers.mission_trails.feature(0).loadGeometry(),first.loadGeometry());assert.equal(roundtrip.layers.mission_trails.feature(0).properties.osm_way_id,first.properties.osm_way_id);checked++;}
 fs.writeFileSync(output+'/'+name,gzipSync(binary));count++;
}
const stats=JSON.parse(fs.readFileSync(input+'/stats.json','utf8'));stats.tiles=count;stats.display_note='z8–9: sport route networks; z10–14: full trail features. Empty attributes and redundant MVT feature IDs omitted; osm_way_id retained.';fs.writeFileSync(output+'/stats.json',JSON.stringify(stats,null,2));console.log({tiles:count,geometryRoundtrips:checked});
