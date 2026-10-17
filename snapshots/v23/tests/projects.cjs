const fs=require('node:fs'),assert=require('node:assert/strict'),ts=require('typescript'),{DatabaseSync}=require('node:sqlite');
const db=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
let user=null;
const env={DB:{prepare(sql){
 let args=[];
 return {
  bind(...v){args=v;return this},
  async first(){return db.prepare(sql).get(...args)||null},
  async all(){return {results:db.prepare(sql).all(...args)}},
  async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}}}
 };
}}};
function compile(file,req){const m={exports:{}};new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(req,m,m.exports);return m.exports}
const api=compile('app/api/projects/route.ts',p=>p==='cloudflare:workers'?{env}:p.includes('chatgpt-auth')?{getChatGPTUser:async()=>user}:require(p));
const snapshot={version:1,edits:{version:1,hidden:[{source:'aq-multi',key:'id',value:12,sourceLayer:''}],muted:[],notes:[]},tracks:[{name:'GPX importé',segments:[{coordinates:[[-68,48],[-67,48]]}]}],settings:{publicStyle:'outline'},center:[-68,48],zoom:13};
const body={kind:'project',name:'Mission privée',data:snapshot};const request=(query='',method='GET',body,origin='https://mission.invalid')=>new Request('https://mission.invalid/api/projects'+query,{method,headers:{origin,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
(async()=>{assert.equal((await api.GET(request())).status,200);assert.equal((await api.POST(request('','POST',body))).status,401);user={userId:'owner'};assert.equal((await api.POST(request('','POST',body,'https://other.invalid'))).status,403);assert.equal((await api.POST(request('','POST',{...body,data:{}}))).status,400);const saved=await api.POST(request('','POST',body));assert.equal(saved.status,201);const {id}=await saved.json();const result=await (await api.GET(request('?id='+id))).json();assert.deepEqual(result.project.data,snapshot);assert(!JSON.stringify(result).includes('owner_id'));user={userId:'other'};assert.equal((await api.GET(request('?id='+id))).status,404);assert.equal((await api.POST(request('','POST',{...body,id}))).status,404);assert.equal((await api.DELETE(request('?id='+id,'DELETE'))).status,404);assert.equal((await (await api.GET(request())).json()).projects.length,0);user={userId:'owner'};assert.equal((await api.POST(request('','POST',{...body,id,name:'Renommé'}))).status,200);assert.equal((await api.POST(request('','POST',{kind:'profile',name:'VTT',data:{sport:'mtb',settings:{trailWidth:3}}}))).status,201);assert.equal((await api.POST(request('','POST',{...body,data:{...snapshot,padding:'é'.repeat(800000)}}))).status,413);assert.equal((await api.DELETE(request('?id='+id,'DELETE'))).status,200);console.log('PASS: projects + real SQLite migrations, anonymous/authenticated flows, private owner isolation, update/delete, GPX/hidden ways roundtrip, profile save, byte limit.');})().catch(e=>{console.error(e);process.exit(1)});
