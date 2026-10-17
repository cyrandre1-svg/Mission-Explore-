const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={Blob,URL,AbortController,console,TextEncoder,TextDecoder,performance};vm.createContext(c);vm.runInContext(fs.readFileSync('public/vendor/contour.js','utf8'),c);const {decodeParsedImage,HeightTile,generateIsolines}=c.mlcontour;
const rgba=new Uint8Array([128,100,128,255,128,100,128,0]);const decoded=decodeParsedImage(2,1,'terrarium',rgba);assert.equal(decoded.data[0],100.5);assert(Number.isNaN(decoded.data[1]),'Nodata must not become a false elevation');
const ramp=new HeightTile(33,33,(x,y)=>x<0||y<0||x>=33||y>=33?NaN:x*.5+100);
const fine=generateIsolines(2.5,ramp),coarse=generateIsolines(5,ramp);assert(Object.keys(fine).length>Object.keys(coarse).length);for(const value of Object.keys(fine))assert.equal(Number(value)%2.5,0);for(const value of Object.keys(coarse))assert.equal(Number(value)%5,0);
const blank=new HeightTile(33,33,()=>NaN);assert.equal(Object.keys(generateIsolines(2.5,blank)).length,0);
console.log('PASS: Terrarium decoding, transparent nodata, 2.5m and 5m contours, empty coverage produces no false lines.');
