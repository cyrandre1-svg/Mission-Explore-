'use strict';
let anchorUndo=null;
function anchorState(t){return {segments:t.segments,start:t.start};}
function canUndoAnchorRemoval(){const t=activeTrack();return !!(t&&anchorUndo?.trackId===t.id&&JSON.stringify(anchorState(t))===anchorUndo.after);}
function undoAnchorRemoval(){if(plannerBusy||!canUndoAnchorRemoval())return;Object.assign(activeTrack(),structuredClone(anchorUndo.before));anchorUndo=null;renderRoute();notice('Point et tracé restaurés.');}
async function removeRouteAnchor(t,index){
 if(plannerBusy||activeTrack()!==t||!Number.isInteger(index)||index<0||index>t.segments.length)return false;
 const before=structuredClone(anchorState(t)),segments=t.segments.slice();
 plannerBusy=true;renderRoute();
 try{
  if(!segments.length)t.start=null;
  else if(index===0)segments.shift();
  else if(index===segments.length)segments.pop();
  else{
   const previous=segments[index-1],next=segments[index];
   if(km(previous.coordinates.at(-1),next.coordinates[0])>.001)throw Error('Ces segments sont disjoints. Modifiez-les séparément.');
   const mode=next.mode==='import'?'direct':next.mode;
   const coordinates=await routed(previous.coordinates[0],next.coordinates.at(-1),mode);
   if(!validCoords(coordinates))throw Error('Recalcul invalide; le tracé initial est conservé.');
   segments.splice(index-1,2,{mode,coordinates});
  }
  t.segments=segments;
  if(segments.length)t.start=segments[0].coordinates[0].slice();
  else if(before.segments.length)t.start=(index===0?before.segments.at(-1).coordinates.at(-1):before.segments[0].coordinates[0]).slice();
  anchorUndo={trackId:t.id,before,after:JSON.stringify(anchorState(t))};
  notice('Point retiré. Annulation disponible dans Modifier les segments.');return true;
 }catch(e){notice(e.message||'Retrait impossible. Le tracé est conservé.',true);return false}
 finally{plannerBusy=false;renderRoute();}
}
function routeAnchorPopup(e){
 if(!map.getLayer('draw-points'))return false;
 const hits=map.queryRenderedFeatures([[e.point.x-10,e.point.y-10],[e.point.x+10,e.point.y+10]],{layers:['draw-points']});if(!hits.length)return false;
 const t=activeTrack(),index=Number(hits[0].properties.anchorIndex);if(!t||hits[0].properties.trackId!==t.id||!Number.isInteger(index))return false;
 const interior=index>0&&index<t.segments.length,mode=interior?t.segments[index].mode:null,box=document.createElement('div'),title=document.createElement('h3');title.textContent='Point du tracé '+(index+1);box.append(title);
 const help=document.createElement('p');help.textContent=interior?(mode==='import'?'Retirer ce point reliera les points voisins en ligne libre. Les deux segments importés seront remplacés.':'Les deux segments voisins seront remplacés par un segment recalculé avec le mode suivant.'):'Retirer cette extrémité enlève le segment adjacent.';box.append(help);
 const button=document.createElement('button');button.textContent=interior&&mode==='import'?'Retirer et relier en ligne libre':interior?'Retirer et recalculer':'Retirer ce point';button.disabled=plannerBusy;button.onclick=()=>{popup?.remove();removeRouteAnchor(t,index)};box.append(button);
 popup?.remove();popup=new maplibregl.Popup().setLngLat(hits[0].geometry.coordinates).setDOMContent(box).addTo(map);return true;
}
