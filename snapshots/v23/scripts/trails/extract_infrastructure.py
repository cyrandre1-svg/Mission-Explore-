"""Extract visible infrastructure from OSM PBF; no inferred lines or supports."""
import sys, json, datetime, collections, argparse
import osmium

parser=argparse.ArgumentParser()
parser.add_argument("inputs",nargs="+")
parser.add_argument("--bounds",default="-70.5,47,-64,49.5")
parser.add_argument("--index",default="flex_mem")
args=parser.parse_args()
BOUNDS=list(map(float,args.bounds.split(",")))
KEYS = ['name', 'ref', 'operator', 'power', 'voltage', 'cables', 'circuits', 'height', 'man_made', 'tower:type', 'generator:source', 'communication:mobile_phone', 'communication:radio', 'communication:television']
factory = osmium.geom.GeoJSONFactory()
features = {}
skipped = 0

def kind(tags, node=False):
    if tags.get('power') in (['tower', 'pole'] if node else ['line', 'minor_line']):
        return tags['power']
    if tags.get('power') == 'generator' and tags.get('generator:source') == 'wind':
        return 'wind'
    if tags.get('man_made') in ['tower', 'mast', 'communications_tower']:
        return 'antenna'

class Extract(osmium.SimpleHandler):
    def emit(self, obj, node):
        global skipped
        tags = dict(obj.tags)
        category = kind(tags, node)
        if not category or (not node and category not in ['line', 'minor_line']):
            return
        try:
            geometry = json.loads((factory.create_point if node else factory.create_linestring)(obj))
        except (osmium.InvalidLocationError, RuntimeError):
            skipped += 1
            return
        coords = [geometry['coordinates']] if node else geometry['coordinates']
        w, s, e, n = BOUNDS
        if max(c[0] for c in coords) < w or min(c[0] for c in coords) > e or max(c[1] for c in coords) < s or min(c[1] for c in coords) > n:
            return
        osm_type = 'node' if node else 'way'
        identity = f'{osm_type}/{obj.id}'
        features[identity] = {'type':'Feature', 'geometry':geometry, 'properties':{**{k:tags[k] for k in KEYS if k in tags}, 'kind':category, 'osm_type':osm_type, 'osm_id':str(obj.id)}}

    def node(self, obj):
        self.emit(obj, True)

    def way(self, obj):
        self.emit(obj, False)

sources = []
for path in args.inputs[:-1]:
    reader = osmium.io.Reader(path)
    sources.append({'file':path.rsplit('/', 1)[-1], 'replication_timestamp':reader.header().get('osmosis_replication_timestamp')})
    reader.close()
    Extract().apply_file(path, locations=True, idx=args.index, filters=[osmium.filter.KeyFilter('power','man_made')])
data = {'type':'FeatureCollection', 'features':list(features.values()), 'metadata':{'source':'© OpenStreetMap contributors · ODbL / extraits OSM France', 'sources':sources, 'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'bounds':BOUNDS, 'skipped_geometry':skipped, 'counts':dict(collections.Counter(f['properties']['kind'] for f in features.values()))}}
with open(args.inputs[-1], 'w') as out:
    json.dump(data, out, ensure_ascii=False, separators=(',', ':'))
print(json.dumps(data['metadata']))
