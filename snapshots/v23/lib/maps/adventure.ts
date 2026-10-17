// Mission's original, deliberately small BRouter cost profile. No inferred permissions.
export type Adventure = {single:number;forest:number;asphalt:number;technical:number;uncertain:number;avoidMain:boolean;footBike:boolean;unpaved:boolean;steep:boolean};
export function adventureOptions(q:URLSearchParams):Adventure{
 const number=(key:string,fallback:number)=>{const raw=q.get(key);if(raw===null)return fallback;const n=Number(raw);if(!Number.isFinite(n)||n<0||n>10)throw Error('Préférence invalide');return n};
 return {single:number('single',7),forest:number('forest',9),asphalt:number('asphalt',2),technical:number('technical',5),uncertain:number('uncertain',3),avoidMain:q.get('avoidMain')!=='false',footBike:q.get('footBike')==='true',unpaved:q.get('unpaved')!=='false',steep:q.get('steep')==='true'};
}
export function adventureProfile(p:Adventure){return `---context:global
assign validForBikes 1
assign considerTurnRestrictions true
assign turnInstructionMode 1
assign uphillcost ${p.steep?120:35}
assign uphillcutoff ${p.steep?3:5}
assign downhillcost ${p.steep?100:20}
assign downhillcutoff ${p.steep?3:8}
---context:way
assign bikeok bicycle=yes|designated|permissive
assign forbidden or bicycle=no|private|dismount or highway=motorway|motorway_link|trunk|trunk_link|construction|proposed or access=private|no or vehicle=no|private and highway=footway|pedestrian|steps ${p.footBike?'not bikeok':'true'}
assign paved surface=paved|asphalt|concrete|paving_stones
assign undocumented and surface= and mtb:scale= tracktype=
assign technicalBad ${p.technical===10?'false':'mtb:scale='+Array.from({length:6},(_,i)=>i+1).filter(v=>v>Math.floor(p.technical*.6)).join('|')}
assign preference switch highway=path ${1+(10-p.single)*.35} switch highway=track ${1+(10-p.forest)*.35} switch paved ${1+(10-p.asphalt)*.35} 2.5
assign badoneway switch reversedirection=yes switch oneway:bicycle=yes true switch oneway= junction=roundabout oneway=yes|true|1 oneway=-1
assign wrongway and badoneway not or oneway:bicycle=no cycleway=opposite|opposite_lane|opposite_track
assign costfactor switch or forbidden wrongway 10000 add preference add switch technicalBad 10000 0 add switch undocumented ${(10-p.uncertain)*.35} 0 add switch and paved ${p.unpaved?'true':'false'} 2 0 switch highway=primary|primary_link|secondary|secondary_link|tertiary ${p.avoidMain?8:0} 0
assign turncost 10
---context:node
assign initialcost switch or bicycle=no|private or access=no|private barrier=stile|turnstile 1000000 0
`}
export function distanceM(a:number[],b:number[]){const r=Math.PI/180,dlat=(b[1]-a[1])*r,dlon=(b[0]-a[0])*r;return 12742000*Math.asin(Math.min(1,Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dlon/2)**2)))}
// Nonoverlapping windows >=100 m: metric explicitly reported as such, not local maximum.
export function grades(c:number[][]){let covered=0,total=0,weighted=0,max:number|null=null,start=0,run=0,valid=true;for(let i=1;i<c.length;i++){const d=distanceM(c[i-1],c[i]);total+=d;run+=d;valid=valid&&Number.isFinite(c[i-1][2])&&Number.isFinite(c[i][2]);if(run>=100||i===c.length-1){if(valid&&run>=50){const slope=100*Math.abs(c[i][2]-c[start][2])/run;weighted+=slope*run;covered+=run;max=Math.max(max??0,slope)}start=i;run=0;valid=true}}return {mean:covered?weighted/covered:null,max,coverage:total?covered/total:0,windowM:100}}
