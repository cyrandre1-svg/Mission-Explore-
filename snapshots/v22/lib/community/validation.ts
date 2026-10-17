const SPORTS=['velo','mtb','randonnee','eaux-vives','ski','autre'];
export function validatePublication(body:any){
 if(body?.consent!==true)throw Error('Confirmez que vous pouvez publier ce tracé et sa description.');
 const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
 const name=clean(body.name,120),author=clean(body.author,80),description=clean(body.description,1500),sport=clean(body.sport,20);
 if(!name||!author||!SPORTS.includes(sport))throw Error('Nom, auteur public et sport sont requis.');
 if(!['member','organization'].includes(body.publisherType))throw Error('Type d’auteur invalide.');
 if(!/^#[0-9a-f]{6}$/i.test(body.color))throw Error('Couleur invalide.');
 if(!Array.isArray(body.segments)||!body.segments.length||body.segments.length>500)throw Error('Tracé invalide ou trop de segments.');
 let count=0,distance=0;const segments=body.segments.map((s:any)=>{if(!Array.isArray(s.coordinates)||s.coordinates.length<2)throw Error('Segment incomplet.');const coordinates=s.coordinates.map((p:any)=>{if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>180||Math.abs(p[1])>85)throw Error('Coordonnées invalides.');if(++count>20000)throw Error('Maximum 20 000 points par publication.');const c=[p[0],p[1]];if(Number.isFinite(p[2]))c.push(p[2]);return c});for(let i=1;i<coordinates.length;i++){const a=coordinates[i-1],b=coordinates[i],r=Math.PI/180,h=Math.sin((b[1]-a[1])*r/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin((b[0]-a[0])*r/2)**2;distance+=12742*Math.asin(Math.sqrt(Math.min(1,h)))}return {mode:'import',coordinates}});
 return {name,author,description,sport,publisherType:body.publisherType,color:body.color,geometry:JSON.stringify(segments),distance};
}
