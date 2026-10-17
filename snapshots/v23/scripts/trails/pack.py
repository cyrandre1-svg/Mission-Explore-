import sys,json,pathlib
from pmtiles.writer import Writer
from pmtiles.tile import zxy_to_tileid,Compression,TileType
folder=pathlib.Path(sys.argv[1]); tiles=[]
for p in folder.glob('*.pbf'):
 z,x,y=map(int,p.stem.split('-'));tiles.append((zxy_to_tileid(z,x,y),p))
with open(sys.argv[2],'wb') as f:
 writer=Writer(f)
 for tid,p in sorted(tiles):writer.write_tile(tid,p.read_bytes())
 writer.finalize({'tile_type':TileType.MVT,'tile_compression':Compression.GZIP,'min_zoom':8,'max_zoom':14,'min_lon_e7':-705000000,'min_lat_e7':470000000,'max_lon_e7':-640000000,'max_lat_e7':495000000},{'name':'Mission Explore · sentiers OSM','attribution':'© OpenStreetMap contributors · ODbL','vector_layers':[{'id':'mission_trails','fields':{},'minzoom':8,'maxzoom':14}]})
print(sys.argv[2],pathlib.Path(sys.argv[2]).stat().st_size)

# Sites static delivery: byte-range emulation with lazy 128 KiB chunks.
archive=pathlib.Path(sys.argv[2]);folder=archive.parent/'trail-chunks-v05';folder.mkdir(exist_ok=True);data=archive.read_bytes()
for i,start in enumerate(range(0,len(data),131072)):(folder/f'{i}.bin').write_bytes(data[start:start+131072])
