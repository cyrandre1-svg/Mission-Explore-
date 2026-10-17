const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const elements=[],context=vm.createContext({console,drawing:false,popup:null,confirm:()=>true,document:{createElement:tag=>{const el={tag,children:[],append(...items){this.children.push(...items)}};elements.push(el);return el}},map:{getLayer:()=>true,queryRenderedFeatures:()=>[{properties:{noteIndex:0}}]},maplibregl:{Popup:class{setLngLat(){return this}setDOMContent(){return this}addTo(){return this}remove(){}}}});
vm.runInContext(fs.readFileSync('public/map-studio.js','utf8'),context);
let edited=null,saved=0;
Object.assign(context,{editStudioNote:n=>edited=n,studioPersist:()=>saved++,studioRenderNotes(){},studioRenderList(){},studioExtraList(){},invalidateStudio(){}});
vm.runInContext(`studioData.notes=[{coordinates:[-68,48],label:'PC 1',kind:'cp',text:'',date:'2026-10-16'}];globalThis.selected=studioMapClick({point:{x:10,y:10}});`,context);
assert.equal(context.selected,true);elements.find(el=>el.textContent==='Modifier le point').onclick();assert.equal(edited.label,'PC 1');elements.find(el=>el.textContent==='Supprimer le point').onclick();assert.equal(saved,1);assert.equal(vm.runInContext('studioData.notes.length',context),0);
console.log('PASS: direct map selection edits and deletes placed symbols, including imported notes without an ID.');
