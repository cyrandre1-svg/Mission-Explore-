const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(path,imports={}){const exports={},context={exports,URLSearchParams,Response,AbortSignal,Number,Map,fetch:async()=>{throw Error('No unexpected network')},require:p=>{if(p in imports)return imports[p];throw Error(p)}};vm.runInNewContext(ts.transpile(fs.readFileSync(path,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}),context);return exports}
const a=load('lib/maps/adventure.ts'),i=load('lib/maps/insight.ts',{'geotiff':{},'./elevation':{},'./adventure':a});
assert.equal(i.documentation({}).percent,0);assert.equal(i.documentation({surface:'gravel',tracktype:'grade2',bicycle:'yes',foot:'yes',access:'yes','mtb:scale':'1'}).percent,100);
const flat=a.grades([[-68,48,100],[-68,48.002,100]]);assert.equal(flat.mean,0);assert.equal(flat.coverage,1);
const hill=a.grades([[-68,48,100],[-68,48.002,150]]);assert(hill.max>20);assert(hill.max<23);
assert.equal(a.grades([[-68,48],[-68,48.002,150]]).max,null);assert.equal(a.grades([[-68,48,0],[-68,48.002,0]]).coverage,1);
assert.throws(()=>a.adventureOptions(new URLSearchParams('single=NaN')));assert.throws(()=>a.adventureOptions(new URLSearchParams('uncertain=11')));
const profile=a.adventureProfile(a.adventureOptions(new URLSearchParams()));assert(profile.includes('or forbidden wrongway'));assert(profile.includes('access=private|no'));assert(profile.includes('assign technicalBad mtb:scale=4|5|6'));
assert(a.adventureProfile(a.adventureOptions(new URLSearchParams('technical=10'))).includes('assign technicalBad false'));
console.log('PASS: unknown terrain attributes, missing/zero elevations, sampled steep grades, bounded preferences, access/oneway/technical constraints.');
