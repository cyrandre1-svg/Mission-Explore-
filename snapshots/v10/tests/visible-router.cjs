const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const ctx={console};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/visible-router.js','utf8'),ctx);const route=ctx.routeVisibleNetwork;
const f=(coordinates,properties={})=>({type:'Feature',properties:{highway:'track',...properties},geometry:{type:'LineString',coordinates}});
const a=[-68,48],mid=[-67.999,48],b=[-67.998,48];let r=route([f([a,mid]),f([mid,b],{mission_kind:'multi'})],[-67.9998,48],[-67.9982,48]);assert(r.length>=3);assert(Math.abs(r[0][0]+67.9998)<1e-7);assert(Math.abs(r.at(-1)[0]+67.9982)<1e-7);
// A line crossing another line is not assumed to be a junction.
assert.throws(()=>route([f([a,b]),f([[-67.999,47.999],[-67.999,48.001]])],a,[-67.999,48.001]),/pas reliés/);
assert.throws(()=>route([f([a,mid]),f([mid,b],{access:'private'})],a,b),/60 m/);
assert.throws(()=>route([f([a,mid]),f([mid,b],{layer:1})],a,b),/pas reliés/);
assert.throws(()=>route([f([a,b])],[-68,48.01],b),/60 m/);
// Snap both control points onto the same edge without travelling to an end first.
r=route([f([a,b])],[-67.9998,48],[-67.9982,48]);assert.equal(r.length,2);
// Disconnected data never become a silent direct connector.
assert.throws(()=>route([f([a,mid]),f([[-67.995,48],[-67.993,48]])],a,[-67.993,48]),/pas reliés/);
console.log('PASS: OSM/AQ joins, edge snapping, disconnected networks, crossings, private access, grade separation and bounded connectors.');

const osm=[f([a,b])],aq=[f([a,mid],{mission_kind:'multi'})];assert.equal(ctx.selectRouteFeatures(osm,aq,'osm'),osm);assert.equal(ctx.selectRouteFeatures(osm,aq,'aq'),aq);assert.equal(ctx.selectRouteFeatures(osm,aq,'all').length,2);console.log('PASS: source selection isolates OSM / AQ geometry for overlapping networks.');
