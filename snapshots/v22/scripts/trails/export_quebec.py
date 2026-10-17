"""Stream original OSM coordinates into bounded gzip shards for provincial GIS exports."""
import sys, pathlib, json, math, gzip, collections, datetime
import osmium
source, target, work, pbf = map(pathlib.Path,sys.argv[1:5])
target.mkdir(parents=True,exist_ok=True);work.mkdir(parents=True,exist_ok=True)
if any(work.glob('*.seq')) or (target/'index.json').exists():raise RuntimeError('Use empty work and output directories to avoid duplicate shards')
handles=collections.OrderedDict();count=0
reader=osmium.io.Reader(str(pbf));timestamp=reader.header().get('osmosis_replication_timestamp');reader.close()
for line in source.open():
    f=json.loads(line);c=f['geometry']['coordinates'];w=min(p[0] for p in c);e=max(p[0] for p in c);s=min(p[1] for p in c);n=max(p[1] for p in c)
    f['properties']['mission_source']='OpenStreetMap / Geofabrik';f['properties']['mission_snapshot']=timestamp
    record=json.dumps(f,ensure_ascii=False,separators=(',',':'))+'\n'
    for x in range(math.floor(w*5),math.floor(e*5)+1):
        for y in range(math.floor(s*5),math.floor(n*5)+1):
            key=f'{x}_{y}'
            stream=handles.pop(key,None)
            if stream is None:stream=(work/(key+'.seq')).open('a')
            handles[key]=stream;stream.write(record)
            if len(handles)>128:handles.popitem(last=False)[1].close()
    count+=1
    if count%100000==0:print(count,'source ways',flush=True)
for stream in handles.values():stream.close()
index=[];total=0
for cell in sorted(work.glob('*.seq')):
    x,y=map(int,cell.stem.split('_'));part=0;records=[];size=0
    def flush():
        global part,records,size,total
        if not records:return
        name=f'{cell.stem}_{part}.json.gz';data=('{"type":"FeatureCollection","features":['+','.join(records)+']}').encode()
        if len(data)>20*1024*1024:raise RuntimeError('Single source object exceeds asset limit')
        compressed=gzip.compress(data,mtime=0);(target/name).write_bytes(compressed);total+=len(compressed)
        index.append({'bbox':[x/5,y/5,(x+1)/5,(y+1)/5],'file':name,'features':len(records),'bytes':len(compressed)})
        records=[];size=0;part+=1
    for line in cell.open():
        if size+len(line)>4*1024*1024:flush()
        records.append(line.strip());size+=len(line)
    flush()
metadata={'source':'© OpenStreetMap contributors / Geofabrik Québec','source_url':'https://download.geofabrik.de/north-america/canada/quebec-latest.osm.pbf','license':'ODbL','replication_timestamp':timestamp,'snapshot':datetime.datetime.now(datetime.timezone.utc).isoformat(),'geometry':'Original OSM node coordinates, not vector tile geometry.','features':count,'compressed_bytes':total}
(target/'index.json').write_text(json.dumps({'metadata':metadata,'tiles':index},ensure_ascii=False,separators=(',',':')))
print(metadata,'shards:',len(index))
