const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{PMTiles}=require('pmtiles');
const context=vm.createContext({Uint8Array,Map,Promise,fetch:async path=>{const b=fs.readFileSync('public'+path);return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}}});
vm.runInContext(fs.readFileSync('public/trails.js','utf8')+'\nglobalThis.ChunkSource=MissionChunkSource;',context);
(async()=>{
 const stats=JSON.parse(fs.readFileSync('public/data/quebec-infrastructure-stats.json'));const binary=Buffer.concat(Array.from({length:stats.chunks},(_,i)=>fs.readFileSync('public'+stats.chunk_path+i+'.bin')));
 const chunks=fs.readdirSync('public/data/quebec-infrastructure-chunks-v1').sort((a,b)=>parseInt(a)-parseInt(b)).map(f=>fs.readFileSync('public/data/quebec-infrastructure-chunks-v1/'+f));
 assert(Buffer.concat(chunks).equals(binary));assert.equal(binary.length,stats.archive_bytes);assert(stats.counts.line>0&&stats.counts.tower>0&&stats.counts.wind>0);
 const archive=new PMTiles(new context.ChunkSource('/data/quebec-infrastructure-chunks-v1')),header=await archive.getHeader(),metadata=await archive.getMetadata();assert.equal(header.maxZoom,14);assert.equal(metadata.vector_layers[0].id,'infrastructure');
 let tileFound=false;for(let x=78;x<=82&&!tileFound;x++)for(let y=87;y<=90&&!tileFound;y++){const tile=await archive.getZxy(8,x,y);if(tile?.data.byteLength)tileFound=true}assert(tileFound);
 console.log('PASS: infrastructure archive/chunks byte parity, actual PMTiles metadata and decoded tile retrieval; '+binary.length+' bytes.');
})().catch(e=>{console.error(e);process.exitCode=1});
