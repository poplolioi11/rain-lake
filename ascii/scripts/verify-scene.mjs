import assert from 'node:assert/strict';
import {RainScene,CAMERA_TILT} from '../dist/scene.js';
const gradient={addColorStop(){}},image=(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h});
function makeCanvas(){let depth=0;const c={save(){depth++;},restore(){assert.ok(depth>0);depth--;},get depth(){return depth;},setTransform(){},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createImageData:image,putImageData(){},getImageData:image,clearRect(){},drawImage(){},fillRect(){},beginPath(){},moveTo(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));},lineTo(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));},bezierCurveTo(...q){assert.ok(q.every(Number.isFinite));},closePath(){},fill(){},stroke(){},fillText(){},globalAlpha:1};return {width:1,height:1,getContext:()=>c,ownerDocument:{createElement:()=>makeCanvas()}};}
const results=[];assert.equal(CAMERA_TILT,Math.PI/4);
for(const [width,height] of [[1280,720],[390,844]]){
 const canvas=makeCanvas(),scene=new RainScene(canvas,{width,height,dpr:2});const y=scene.project(0,100,0).y;assert.ok(Math.abs(y-100*Math.SQRT1_2)<1e-9);let peak=0;
 for(let i=0;i<180*60;i++){scene.step(1/60);assert.ok(scene.rain.length<=64);assert.ok(scene.splashes.length<=24);if(i%600===0){scene.draw();assert.equal(scene.ctx.depth,0);for(const n of scene.wave.current){assert.ok(Number.isFinite(n));peak=Math.max(peak,Math.abs(n));}assert.ok(peak<8);assert.ok(scene.fish.fishes.every(f=>[f.x,f.z,f.heading,f.opacity].every(Number.isFinite)));}}
 assert.ok(scene.impactCount>500);assert.ok(scene.dpr<=1.25);assert.ok(scene.wave.current.some(n=>n<0));assert.ok(scene.wave.current.some(n=>n>0));const impacts=scene.impactCount;
 scene.step(NaN);scene.step(Infinity);scene.resize(height,width,1);scene.draw();assert.equal(scene.ctx.depth,0);results.push({width,height,seconds:180,simulationHz:60,impacts,peakHeight:peak,maxNodes:scene.wave.cols*scene.wave.rows,canvasStateRestored:true});
}
console.log(JSON.stringify({passed:true,results},null,2));
