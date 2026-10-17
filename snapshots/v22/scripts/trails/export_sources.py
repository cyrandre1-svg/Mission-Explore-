import pathlib,json,math,datetime,sys
root=pathlib.Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=True)
byid={}
for filename in sys.argv[2:]:
 for line in pathlib.Path(filename).open():
  f=json.loads(line);byid[f['properties']['osm_way_id']]=f
cells={}
for f in byid.values():
 c=f['geometry']['coordinates'];pts=c if f['geometry']['type']=='LineString' else [p for l in c for p in l];w=min(p[0] for p in pts);e=max(p[0] for p in pts);s=min(p[1] for p in pts);n=max(p[1] for p in pts)
 if e< -70.5 or w> -64 or n<47 or s>49.5:continue
 f['properties']['mission_source']='OpenStreetMap / OSM France';f['properties']['mission_snapshot']=datetime.datetime.now(datetime.timezone.utc).date().isoformat()
 for x in range(math.floor(w*10),math.floor(e*10)+1):
  for y in range(math.floor(s*10),math.floor(n*10)+1):cells.setdefault((x,y),[]).append(f)
index=[]
for (x,y),features in cells.items():
 name=f'{x}_{y}.json';(root/name).write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':')));index.append({'bbox':[x/10,y/10,(x+1)/10,(y+1)/10],'file':name})
(root/'index.json').write_text(json.dumps({'metadata':{'source':'OpenStreetMap contributors / OSM France','license':'ODbL','snapshot':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'geometry':'Original OSM node coordinates, not vector tile geometry.'},'tiles':index},separators=(',',':')))
print(len(byid),'ways',len(index),'shards',sum(p.stat().st_size for p in root.iterdir()),'bytes')
