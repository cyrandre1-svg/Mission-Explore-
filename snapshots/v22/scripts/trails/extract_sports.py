"""Regional OSM sport overlay; source tags preserved, no inferred rapids or ski safety."""
import osmium,json,sys,collections,datetime
factory=osmium.geom.GeoJSONFactory()
features={};skipped=0
KEYS=['name','piste:name','piste:type','piste:grooming','piste:difficulty','whitewater','whitewater:rapid_grade','whitewater:section_grade','whitewater:grade','rapids','waterway','canoe','paddlecraft','access','ownership','operator','ref']
def kinds(t):
 result=[]
 if t.get('waterway') in ['rapids','waterfall','weir','dam'] or any(k.startswith('whitewater') for k in t) or t.get('rapids') not in [None,'no'] or t.get('paddlecraft') or t.get('canoe') in ['put_in','egress','put_in;egress']:result.append('whitewater')
 if 'skitour' in t.get('piste:type','').split(';') or t.get('piste:grooming')=='backcountry':result.append('ski')
 return result
class Emitter(osmium.SimpleHandler):
 def emit(self,o,geometry,kind,typ):
  global skipped
  try:g=json.loads(geometry(o))
  except (osmium.InvalidLocationError,RuntimeError):skipped+=1;return
  def coords(c):
   if c and isinstance(c[0],(float,int)):yield c
   else:
    for v in c:yield from coords(v)
  if not any(-70.5<=c[0]<=-64 and 47<=c[1]<=49.5 for c in coords(g['coordinates'])):return
  t=dict(o.tags);p={k.replace(':','_'):v for k,v in t.items() if k in KEYS};p.update(kind=kind,osm_type=typ,osm_id=o.id,name=t.get('name',t.get('piste:name','')));features[f'{kind}:{typ}:{o.id}']={'type':'Feature','properties':p,'geometry':g}
 def node(self,o):
  for k in kinds(dict(o.tags)):self.emit(o,factory.create_point,k,'node')
 def way(self,o):
  for k in kinds(dict(o.tags)):
   if not o.is_closed():self.emit(o,factory.create_linestring,k,'way')
 def area(self,o):
  for k in kinds(dict(o.tags)):self.emit(o,factory.create_multipolygon,k,'way' if o.from_way() else 'relation')
for path in sys.argv[1:-1]:Emitter().apply_file(path,locations=True,idx='flex_mem')
data={'type':'FeatureCollection','features':list(features.values()),'metadata':{'source':'© OpenStreetMap contributors / OSM France · ODbL','generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'skipped_geometry':skipped,'counts':dict(collections.Counter(f['properties']['kind'] for f in features.values()))}}
with open(sys.argv[-1],'w') as f:json.dump(data,f,ensure_ascii=False,separators=(',',':'))
print(data['metadata'],len(json.dumps(data)))
