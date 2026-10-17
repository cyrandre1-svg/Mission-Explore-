import sys, json, pathlib
from pmtiles.writer import Writer
from pmtiles.tile import zxy_to_tileid, Compression, TileType

folder, output = map(pathlib.Path, sys.argv[1:3])
tiles = []
for path in folder.glob('*.pbf'):
    z, x, y = map(int, path.stem.split('-'))
    tiles.append((zxy_to_tileid(z, x, y), path))
with output.open('wb') as stream:
    writer = Writer(stream)
    for identity, path in sorted(tiles):
        writer.write_tile(identity, path.read_bytes())
    writer.finalize({'tile_type':TileType.MVT, 'tile_compression':Compression.GZIP, 'min_zoom':8, 'max_zoom':14, 'min_lon_e7':-705000000, 'min_lat_e7':470000000, 'max_lon_e7':-640000000, 'max_lat_e7':495000000}, {'name':'Mission Explore · infrastructures OSM', 'attribution':'© OpenStreetMap contributors · ODbL', 'vector_layers':[{'id':'infrastructure','fields':{},'minzoom':8,'maxzoom':14}]})
chunks = output.parent / 'infrastructure-chunks-v1'
chunks.mkdir(exist_ok=True)
data = output.read_bytes()
for index, start in enumerate(range(0,len(data),131072)):
    (chunks / f'{index}.bin').write_bytes(data[start:start+131072])
stats = json.loads((folder/'stats.json').read_text())
stats['archive_bytes'] = len(data)
(output.parent/'infrastructure-stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2))
print({'archive_bytes':len(data),'chunks':len(list(chunks.glob('*.bin')))})
