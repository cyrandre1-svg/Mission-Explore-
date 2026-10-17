'use strict';
const INFRASTRUCTURE_LAYERS=['infrastructure-halo','infrastructure-lines','infrastructure-supports','infrastructure-poles','infrastructure-landmarks'];
const INFRASTRUCTURE_NAMES={line:'Ligne électrique',minor_line:'Ligne électrique secondaire',tower:'Pylône électrique',pole:'Poteau électrique',antenna:'Tour / antenne',wind:'Éolienne'};
function infrastructureIcon(kind){const width=32,height=32,data=new Uint8Array(width*height*4),segments=kind==='wind'?[[16,13,16,30],[16,13,8,2],[16,13,30,11],[16,13,7,24]]:[[10,30,16,8],[16,8,22,30],[10,30,22,30],[12,23,20,23],[14,16,18,16],[16,8,16,3],[5,5,2,11],[2,11,5,17],[27,5,30,11],[30,11,27,17]];for(const [x,y,a,b] of segments){const n=Math.ceil(Math.hypot(a-x,b-y)*2);for(let i=0;i<=n;i++){const px=Math.round(x+(a-x)*i/n),py=Math.round(y+(b-y)*i/n);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(px+dx>=0&&px+dx<width&&py+dy>=0&&py+dy<height)data.set([255,253,245,255],((py+dy)*width+px+dx)*4)}}for(const [x,y,a,b] of segments){const n=Math.ceil(Math.hypot(a-x,b-y)*2);for(let i=0;i<=n;i++){const px=Math.round(x+(a-x)*i/n),py=Math.round(y+(b-y)*i/n);data.set([104,80,110,255],(py*width+px)*4)}}return {width,height,data};}
function setupInfrastructure(before){
 const url=location.origin+'/data/quebec-infrastructure-chunks-v1';
 // One shared protocol dispatches every archive; registration is owned by trails.js.
 missionTileProtocol.add(new pmtiles.PMTiles(new MissionChunkSource(url)));
 map.addSource('mission-infrastructure',{type:'vector',url:'pmtiles://'+url,bounds:[-80,44.9,-57,62.7],attribution:'© OpenStreetMap contributors · ODbL / Geofabrik'});
 const base={source:'mission-infrastructure','source-layer':'infrastructure',minzoom:8,layout:{visibility:'none'}},lines=['in',['get','kind'],['literal',['line','minor_line']]];
 map.addLayer({...base,id:'infrastructure-halo',type:'line',filter:lines,paint:{'line-color':'#fffdf4','line-width':3.3,'line-opacity':.7}},before);
 map.addLayer({...base,id:'infrastructure-lines',type:'line',filter:lines,paint:{'line-color':'#726077','line-width':['match',['get','kind'],'line',1.1,.7],'line-dasharray':[7,2],'line-opacity':.95}},before);
 map.addLayer({...base,id:'infrastructure-supports',type:'symbol',minzoom:13,filter:['==',['get','kind'],'tower'],layout:{visibility:'none','text-field':'◇','text-font':['Noto Sans Regular'],'text-size':16,'text-allow-overlap':false,'text-padding':2},paint:{'text-color':'#68506e','text-halo-color':'#fffdf5','text-halo-width':1.4}},before);
 map.addLayer({...base,id:'infrastructure-poles',type:'circle',minzoom:15,filter:['==',['get','kind'],'pole'],paint:{'circle-radius':2.3,'circle-color':'#68506e','circle-stroke-color':'#fffdf5','circle-stroke-width':1}},before);
 for(const kind of ['antenna','wind'])map.addImage('infrastructure-'+kind,infrastructureIcon(kind),{pixelRatio:1});
 map.addLayer({...base,id:'infrastructure-landmarks',type:'symbol',minzoom:13,filter:['all',['==',['geometry-type'],'Point'],['in',['get','kind'],['literal',['antenna','wind']]]],layout:{visibility:'none','icon-image':['concat','infrastructure-',['get','kind']],'icon-size':.65,'icon-padding':4}},before);
}
function applyInfrastructure(){for(const id of INFRASTRUCTURE_LAYERS)visibility(id,!!settings.infrastructure);}
function infrastructurePopup(e){
 if(!settings.infrastructure)return false;
 const ids=INFRASTRUCTURE_LAYERS.filter(id=>id!=='infrastructure-halo'&&map.getLayer(id)),hits=map.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers:ids});if(!hits.length)return false;
 const p=hits[0].properties,box=document.createElement('div'),title=document.createElement('h3');title.textContent=p.name||INFRASTRUCTURE_NAMES[p.kind]||'Infrastructure';box.append(title);
 for(const [key,label] of [['kind','Type'],['ref','Référence'],['operator','Exploitant'],['voltage','Tension déclarée (V)'],['height','Hauteur déclarée'],['tower:type','Type de tour']])if(p[key]){const row=document.createElement('div');row.textContent=label+' : '+(key==='kind'?INFRASTRUCTURE_NAMES[p[key]]:p[key]);box.append(row)}
 const note=document.createElement('small');note.textContent='Inventaire OSM partiel. Une emprise électrique ne confirme pas un droit de passage.';box.append(note);
 if(['node','way'].includes(p.osm_type)&&/^\d+$/.test(p.osm_id)){const a=document.createElement('a');a.href='https://www.openstreetmap.org/'+p.osm_type+'/'+p.osm_id;a.target='_blank';a.rel='noopener';a.textContent='Voir la source OSM ↗';box.append(a)}
 popup?.remove();popup=new maplibregl.Popup().setLngLat(e.lngLat).setDOMContent(box).addTo(map);return true;
}
