'use strict';
importScripts('/vendor/sql-wasm.js','/gis-export.js?v=0.10');
self.onmessage=async e=>{try{if(e.data.format==='gpkg'){const bytes=await gisGeoPackage(e.data.fc);self.postMessage({bytes:bytes.buffer},[bytes.buffer])}else{const zip=gisShapefile(e.data.fc),bytes=await zip.arrayBuffer();self.postMessage({bytes},[bytes])}}catch(e){self.postMessage({error:e.message})}};
