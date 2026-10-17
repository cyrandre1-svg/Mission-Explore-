const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context=vm.createContext({console,crypto:require('crypto').webcrypto,structuredClone,notice(){},renderRoute(){}});
vm.runInContext(fs.readFileSync('public/planner.js','utf8')+'\n'+fs.readFileSync('public/route-points.js','utf8')+'\n'+fs.readFileSync('public/explore.js','utf8').match(/function km\(a,b\)\{[^\n]+/)[0],context);
(async()=>{
 await vm.runInContext(`(async()=>{
  renderRoute=()=>{};
  globalThis.t=makeTrack('Editable',[{mode:'trekking',coordinates:[[-68,48],[-68,48.01]]},{mode:'trekking',coordinates:[[-68,48.01],[-68,48.02]]}]);
  globalThis.calls=[];routed=async(a,b,mode)=>{calls.push({a,b,mode});return [a,b]};
  globalThis.before=JSON.stringify(anchorState(t));
  if(!await removeRouteAnchor(t,1)||t.segments.length!==1||calls[0].mode!=='trekking')throw Error('Interior recomputation');
  if(!canUndoAnchorRemoval())throw Error('Missing undo');undoAnchorRemoval();if(JSON.stringify(anchorState(t))!==before)throw Error('Undo not exact');
  routed=async()=>{throw Error('offline')};if(await removeRouteAnchor(t,1)||JSON.stringify(anchorState(t))!==before)throw Error('Failure changed original');
  t.segments[1].mode='import';routed=async(a,b,mode)=>{if(mode!=='direct')throw Error('Imported segment must use explicit free line');return [a,b]};
  if(!await removeRouteAnchor(t,1))throw Error('Imported removal');t.segments.push({mode:'direct',coordinates:[[-68,48.02],[-68,48.03]]});if(canUndoAnchorRemoval())throw Error('Stale undo allowed');
  globalThis.endpoint=makeTrack('Endpoint',[{mode:'direct',coordinates:[[-68,48],[-68,48.01]]}]);if(!await removeRouteAnchor(endpoint,0)||endpoint.segments.length||endpoint.start[1]!==48.01)throw Error('Endpoint removal');undoAnchorRemoval();if(endpoint.segments.length!==1)throw Error('Endpoint undo');
  endpoint.segments=[];endpoint.start=[-68,48];if(!await removeRouteAnchor(endpoint,0)||endpoint.start!==null)throw Error('Start removal');undoAnchorRemoval();if(endpoint.start[0]!==-68)throw Error('Start undo');
  globalThis.gap=makeTrack('Disconnected',[{mode:'import',coordinates:[[-68,48],[-68,48.01]]},{mode:'import',coordinates:[[-67,48],[-67,48.01]]}]);globalThis.gapBefore=JSON.stringify(anchorState(gap));if(await removeRouteAnchor(gap,1)||JSON.stringify(anchorState(gap))!==gapBefore)throw Error('Disconnected geometry joined');
 })()`,context);
 console.log('PASS: anchor deletion, recalculation, exact undo, failed routing preservation, explicit imported joins, endpoints and disconnected segments.');
})().catch(e=>{console.error(e);process.exitCode=1});
