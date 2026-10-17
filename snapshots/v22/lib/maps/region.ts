// Request envelope for the Quebec map. The OSM extract follows the provincial
// boundary; service data availability is independently defined by each producer.
export const MAP_BOUNDS=[-80,44.9,-57,62.7] as const;
export function inMapExtent(lon:number,lat:number){return Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=MAP_BOUNDS[0]&&lon<=MAP_BOUNDS[2]&&lat>=MAP_BOUNDS[1]&&lat<=MAP_BOUNDS[3];}
export function validBBox(box:number[],maxArea:number){return box.length===4&&box.every(Number.isFinite)&&inMapExtent(box[0],box[1])&&inMapExtent(box[2],box[3])&&box[2]>box[0]&&box[3]>box[1]&&(box[2]-box[0])*(box[3]-box[1])<=maxArea;}
