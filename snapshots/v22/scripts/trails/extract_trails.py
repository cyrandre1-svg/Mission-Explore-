#!/usr/bin/env python3
"""
Mission Explore trail extractor.

Two-pass extraction:
1. Collect relevant OSM route relations and their member way IDs.
2. Emit trail/track/cycle/service ways as GeoJSONSeq with normalized properties.

Requires: pip install osmium
"""

from __future__ import annotations
import argparse
import json
from collections import defaultdict
import osmium

ALLOWED_HIGHWAYS = {
    "path",
    "track",
    "cycleway",
    "bridleway",
    "footway",
    "service",
    "pedestrian",
    "unclassified",
}

ROUTE_TYPES = {"mtb", "bicycle", "hiking"}

SURFACE_PAVED = {
    "paved", "asphalt", "concrete", "concrete:plates", "concrete:lanes",
    "paving_stones", "sett", "cobblestone", "metal", "wood"
}
SURFACE_UNPAVED = {
    "unpaved", "gravel", "fine_gravel", "compacted", "dirt", "earth",
    "ground", "grass", "sand", "mud", "rock", "pebblestone", "woodchips"
}

def sval(tags, key, default=""):
    try:
        return tags[key]
    except KeyError:
        return default

def num_prefix(value: str):
    if not value:
        return None
    token = value.split(";", 1)[0].strip()
    for suffix in ("+", "-"):
        token = token.replace(suffix, "")
    try:
        return float(token)
    except Exception:
        return None

def surface_group(surface: str):
    if surface in SURFACE_PAVED:
        return "paved"
    if surface in SURFACE_UNPAVED:
        return "unpaved"
    return "unknown"

def difficulty_bucket(tags):
    """
    Configurable default Mission mapping.
    We preserve raw OSM values separately so the UI can change the mapping later.
    """
    # IMBA and STS are different scales. Never silently convert STS to IMBA.
    return {"0":"easiest","1":"easy","2":"intermediate","3":"difficult","4":"expert"}.get(sval(tags,"mtb:scale:imba"),"unknown")

def trail_class(tags, relation_routes):
    highway = sval(tags, "highway")
    bicycle = sval(tags, "bicycle")
    mtb_scale = sval(tags, "mtb:scale")
    mtb_imba = sval(tags, "mtb:scale:imba")
    mtb_type = sval(tags, "mtb:type")

    if "mtb" in relation_routes or mtb_scale or mtb_imba or mtb_type:
        return "mtb"
    if highway == "cycleway" or bicycle in {"yes", "designated", "permissive"} or "bicycle" in relation_routes:
        return "bike"
    if highway == "track":
        return "track"
    if highway == "service":
        return "service"
    if "hiking" in relation_routes:
        return "hiking"
    return "trail"

class RelationCollector(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.by_way = defaultdict(list)

    def relation(self, r):
        if sval(r.tags, "type") != "route":
            return
        route = sval(r.tags, "route")
        if route not in ROUTE_TYPES:
            return

        info = {
            "route": route,
            "name": sval(r.tags, "name"),
            "ref": sval(r.tags, "ref"),
            "network": sval(r.tags, "network"),
            "operator": sval(r.tags, "operator"),
            "relation_id": r.id,
        }
        for m in r.members:
            if m.type == "w":
                self.by_way[m.ref].append(info)

class WayEmitter(osmium.SimpleHandler):
    def __init__(self, out_path, relation_map, bounds=(-70.5,47,-64,49.5)):
        super().__init__()
        self.out = open(out_path, "w", encoding="utf-8")
        self.relation_map = relation_map
        self.bounds = bounds
        self.count = 0
        self.skipped_geometry = 0

    def close(self):
        self.out.close()

    def way(self, w):
        highway = sval(w.tags, "highway")

        # Exclude obvious driveway/parking-only service lanes unless they carry
        # trail/bike context.
        service = sval(w.tags, "service")
        rels = self.relation_map.get(w.id, [])
        route_types = {x["route"] for x in rels}
        if highway not in ALLOWED_HIGHWAYS and not (highway and route_types):
            return
        has_trail_context = (
            route_types
            or sval(w.tags, "mtb:scale")
            or sval(w.tags, "mtb:scale:imba")
            or sval(w.tags, "bicycle") in {"yes", "designated", "permissive"}
        )
        if highway == "service" and service in {"driveway", "parking_aisle"} and not has_trail_context:
            return

        coords = []
        try:
            for n in w.nodes:
                if not n.location.valid():
                    self.skipped_geometry += 1
                    return
                coords.append([n.lon, n.lat])
        except osmium.InvalidLocationError:
            self.skipped_geometry += 1
            return

        if len(coords) < 2:
            return

        west,south,east,north = self.bounds
        if max(c[0] for c in coords)<west or min(c[0] for c in coords)>east or max(c[1] for c in coords)<south or min(c[1] for c in coords)>north:
            return

        names = [x["name"] for x in rels if x["name"]]
        refs = [x["ref"] for x in rels if x["ref"]]
        operators = [x["operator"] for x in rels if x["operator"]]

        props = {
            "osm_way_id": w.id,
            "name": sval(w.tags, "name"),
            "ref": sval(w.tags, "ref"),
            "highway": highway,
            "service": service,
            "access": sval(w.tags, "access"),
            "bicycle": sval(w.tags, "bicycle"),
            "foot": sval(w.tags, "foot"),
            "sac_scale": sval(w.tags, "sac_scale"),
            "operator": sval(w.tags, "operator"),
            "access_conditional": sval(w.tags, "access:conditional"),
            "bicycle_conditional": sval(w.tags, "bicycle:conditional"),
            "foot_conditional": sval(w.tags, "foot:conditional"),
            "horse": sval(w.tags, "horse"),
            "surface": sval(w.tags, "surface"),
            "surface_group": surface_group(sval(w.tags, "surface")),
            "smoothness": sval(w.tags, "smoothness"),
            "tracktype": sval(w.tags, "tracktype"),
            "width": sval(w.tags, "width"),
            "incline": sval(w.tags, "incline"),
            "trail_visibility": sval(w.tags, "trail_visibility"),
            "oneway": sval(w.tags, "oneway"),
            "oneway_bicycle": sval(w.tags, "oneway:bicycle"),
            "mtb_scale": sval(w.tags, "mtb:scale"),
            "mtb_scale_imba": sval(w.tags, "mtb:scale:imba"),
            "mtb_scale_uphill": sval(w.tags, "mtb:scale:uphill"),
            "mtb_type": sval(w.tags, "mtb:type"),
            "difficulty": difficulty_bucket(w.tags),
            "trail_class": trail_class(w.tags, route_types),
            "route_mtb": "mtb" in route_types,
            "route_bicycle": "bicycle" in route_types,
            "route_hiking": "hiking" in route_types,
            "route_names": " | ".join(dict.fromkeys(names)),
            "route_refs": " | ".join(dict.fromkeys(refs)),
            "route_operators": " | ".join(dict.fromkeys(operators)),
        }

        feature = {
            "type": "Feature",
            "id": w.id,
            "properties": props,
            "geometry": {
                "type": "LineString",
                "coordinates": coords,
            },
        }
        self.out.write(json.dumps(feature, ensure_ascii=False, separators=(",", ":")) + "\n")
        self.count += 1

def main():
    p = argparse.ArgumentParser()
    p.add_argument("input_pbf")
    p.add_argument("output_geojsonseq")
    p.add_argument("--bounds", default="-70.5,47,-64,49.5")
    p.add_argument("--index", default="flex_mem")
    args = p.parse_args()

    print("Pass 1/2: relations MTB / vélo / randonnée")
    rc = RelationCollector()
    rc.apply_file(args.input_pbf, locations=False)
    print(f"  {len(rc.by_way):,} ways membres de relations pertinentes")

    print("Pass 2/2: géométries et attributs")
    em = WayEmitter(args.output_geojsonseq, rc.by_way, tuple(map(float,args.bounds.split(","))))
    try:
        em.apply_file(args.input_pbf, locations=True, idx=args.index, filters=[osmium.filter.KeyFilter("highway")])
    finally:
        em.close()

    print(f"  {em.count:,} tronçons exportés")
    if em.skipped_geometry:
        print(f"  {em.skipped_geometry:,} tronçons ignorés (géométrie incomplète)")

if __name__ == "__main__":
    main()
