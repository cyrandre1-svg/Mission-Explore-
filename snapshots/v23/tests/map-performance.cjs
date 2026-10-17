const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let fetches=0,loads=0,resolveFetch;
const response=new Promise(resolve=>resolveFetch=resolve),nodes=new Map();
const context=vm.createContext({console,Map,setTimeout,clearTimeout,settings:{whitewater:false,skiTour:false,sportOpacity:90,sportNames:true},fetch(){fetches++;return response},map:{getSource(){return {setData(){loads++}}}},visibility(){},setPaint(){},$:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id)}});
vm.runInContext(fs.readFileSync('public/cartography.js','utf8'),context);
(async()=>{
 vm.runInContext('applySportLayers()',context);assert.equal(fetches,0);
 vm.runInContext('settings.whitewater=true;applySportLayers();applySportLayers()',context);assert.equal(fetches,1);
 resolveFetch({ok:true,json:async()=>({type:'FeatureCollection',features:[],metadata:{counts:{whitewater:1,ski:2}}})});
 await vm.runInContext('sportDataPromise',context);assert.equal(loads,1);vm.runInContext('applySportLayers()',context);assert.equal(fetches,1);
 assert(!fs.readFileSync('public/explore.js','utf8').includes("data:'/data/lidar-index.geojson'"));
 let worker,updates=0;const posted=[];
 const batching=vm.createContext({Map,JSON,Number,clearTimeout(){},setTimeout(){return 0},ready:true,settings:{mapView:'map',networkStyle:'unified',aqMulti:true},NETWORKS:[{key:'aqMulti',kind:'multi'}],networkData:{multi:{type:'FeatureCollection',features:[]}},map:{getSource(){return {setData(){updates++}}}},$:()=>({}),Worker:class{constructor(){worker=this}postMessage(value){posted.push(value)}terminate(){}}});
 vm.runInContext(fs.readFileSync('public/map-controls.js','utf8')+';queryNetworkReferences=()=>[];refreshNetworkDisplay();refreshNetworkDisplay();refreshNetworkDisplay();',batching);assert.equal(posted.length,1);
 worker.onmessage({data:{generation:posted[0].generation,collections:{multi:{features:[]}},masked:0}});assert.equal(updates,0);
 vm.runInContext('refreshNetworkDisplay()',batching);assert.equal(posted.length,2);worker.onmessage({data:{generation:posted[1].generation,collections:{multi:{features:[]}},masked:0}});assert.equal(updates,1);
 console.log('PASS: duplicate processing has one active job and one latest queued request; obsolete replies cannot update sources.');
 console.log('PASS: disabled sport layers make zero data requests; concurrent enable calls share one response; coverage data is deferred.');
})().catch(e=>{console.error(e);process.exitCode=1});
