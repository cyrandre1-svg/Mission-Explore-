import sys, pathlib, json, hashlib, datetime
import osmium
from pmtiles.writer import Writer
from pmtiles.tile import zxy_to_tileid, Compression, TileType
folder, archive, public, pbf = map(pathlib.Path,sys.argv[1:5])
kind=sys.argv[5]
stats=json.loads((folder/'stats.json').read_text())
tiles=[]
for path in folder.glob('*.pbf'):
    z,x,y=map(int,path.stem.split('-'));tiles.append((zxy_to_tileid(z,x,y),path))
with archive.open('wb') as stream:
    writer=Writer(stream)
    for identity,path in sorted(tiles):writer.write_tile(identity,path.read_bytes())
    writer.finalize({'tile_type':TileType.MVT,'tile_compression':Compression.GZIP,'min_zoom':8,'max_zoom':14,'min_lon_e7':-800000000,'min_lat_e7':449000000,'max_lon_e7':-570000000,'max_lat_e7':627000000},{'name':'Mission Explore · Québec · '+kind,'attribution':'© OpenStreetMap contributors · ODbL / Geofabrik','vector_layers':[{'id':stats['layer'],'fields':{},'minzoom':8,'maxzoom':14}]})
chunks=public/f'quebec-{kind}-chunks-v1';chunks.mkdir(exist_ok=True,parents=True)
for old in chunks.glob('*.bin'):old.unlink()
with archive.open('rb') as stream:
    index=0;digest=hashlib.sha256()
    while data:=stream.read(131072):
        (chunks/f'{index}.bin').write_bytes(data);digest.update(data);index+=1
reader=osmium.io.Reader(str(pbf));stats['replication_timestamp']=reader.header().get('osmosis_replication_timestamp');reader.close()
stats.update(archive_bytes=archive.stat().st_size,sha256=digest.hexdigest(),chunks=index,chunk_size=131072,chunk_path=f'/data/quebec-{kind}-chunks-v1/')
(public/f'quebec-{kind}-stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2))
print(json.dumps(stats))
