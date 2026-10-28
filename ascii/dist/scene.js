import {WaveField} from './wave-field.js?v=0.2.0';
import {FishShadows} from './fish-shadows.js?v=0.2.0';

export const CAMERA_TILT=Math.PI/4;
const FLAT=Math.sin(CAMERA_TILT),MAX_RAIN=64;
class Random{
 constructor(seed){this.state=seed>>>0;}
 next(){this.state=(Math.imul(this.state,1664525)+1013904223)>>>0;return this.state/4294967296;}
}
const hash=(x,y)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+31,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;};

export class RainScene{
 constructor(canvas,{width=1280,height=720,dpr=1,seed=27}={}){
  this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.random=new Random(seed);
  this.waveCanvas=(canvas.ownerDocument||document).createElement('canvas');this.waveContext=this.waveCanvas.getContext('2d');
  this.fish=new FishShadows(seed+6);this.wave=new WaveField({width:1,depth:1,cellSize:5});this.time=0;this.resize(width,height,dpr);
 }
 resize(width,height,dpr=1){
  this.width=Math.max(1,width);this.height=Math.max(1,height);this.depth=this.height/FLAT;this.dpr=Math.min(1.25,Math.max(1,dpr||1));
  this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
  this.wave.resize({width:this.width,depth:this.depth,cellSize:5});

  this.fish.resize(this.width,this.depth);this.rain=[];this.splashes=[];this.impactCount=0;this.spawnDebt=0;
  this.rainRate=15*Math.min(1.25,Math.max(.65,this.width*this.height/921600));
  this.samples=[];const cw=this.width<600?5.4:6.4,ch=this.width<600?7.6:8.8;this.glyphSize=ch*.96;this.maskCols=Math.ceil(this.width/cw);this.maskRows=Math.ceil(this.height/ch);this.waveCanvas.width=this.maskCols;this.waveCanvas.height=this.maskRows;
  for(let y=ch*.5,row=0;y<this.height;y+=ch,row++)for(let x=cw*.5,col=0;x<this.width;x+=cw,col++){
   const i=Math.min(this.wave.cols-2,Math.max(1,Math.round(x/this.width*(this.wave.cols-1))));
   const j=Math.min(this.wave.rows-2,Math.max(1,Math.round(y/this.height*(this.wave.rows-1))));
   this.samples.push({x,y,k:j*this.wave.cols+i,maskIndex:(row*this.maskCols+col)*4,noise:hash(col,row)});
  }
  this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  this.base=this.ctx.createLinearGradient(0,0,this.width*.15,this.height);this.base.addColorStop(0,'#27363b');this.base.addColorStop(.42,'#1c2b31');this.base.addColorStop(1,'#0e1c23');
  this.edge=this.ctx.createRadialGradient(this.width*.48,this.height*.43,this.width*.1,this.width*.5,this.height*.5,Math.max(this.width,this.height)*.74);this.edge.addColorStop(0,'rgba(1,9,14,0)');this.edge.addColorStop(1,'rgba(1,9,14,.34)');
  for(let i=0;i<96;i++)this.step(1/30);
 }
 project=(x,z,depth=0)=>({x,y:z*FLAT+depth*.6,scale:1});
 _spawn(){
  if(this.rain.length>=MAX_RAIN)return;
  const r=this.random,x=r.next()*this.width,z=(.015+r.next()*.97)*this.depth,duration=.36+r.next()*.43,near=z/this.depth;
  const fall=190+r.next()*140+near*80;
  this.rain.push({x,z,age:0,duration,fall,length:12+r.next()*19+near*9,alpha:.18+r.next()*.10+near*.06,force:.30+r.next()*.5,drift:(r.next()-.5)*3});
 }
 step(dt){
  const delta=Math.min(.1,Math.max(0,Number.isFinite(dt)?dt:0));this.time+=delta;
  this.spawnDebt+=delta*this.rainRate;while(this.spawnDebt>=1){this.spawnDebt--;this._spawn();}
  for(let i=this.rain.length-1;i>=0;i--){const drop=this.rain[i];drop.age+=delta;if(drop.age>=drop.duration){const radius=Math.max(4.8,Math.min(this.wave.cellX,this.wave.cellZ)*.9);this.wave.disturb(drop.x,drop.z,-drop.force,radius);this.wave.disturb(drop.x,drop.z,drop.force/(1.7*1.7),radius*1.7);this.impactCount++;if(this.splashes.length<24)this.splashes.push({x:drop.x,y:drop.z*FLAT,age:0,life:.15});this.rain.splice(i,1);}}
  for(let i=this.splashes.length-1;i>=0;i--){this.splashes[i].age+=delta;if(this.splashes[i].age>this.splashes[i].life)this.splashes.splice(i,1);}
  this.wave.step(delta);this.fish.step(delta,this.time);
 }
 _asciiShadows(){
  const m=this.waveContext;m.setTransform(this.maskCols/this.width,0,0,this.maskRows/this.height,0,0);m.clearRect(0,0,this.width,this.height);this.fish.draw(m,this.project,this.time);
  const pixels=m.getImageData(0,0,this.maskCols,this.maskRows).data,ctx=this.ctx;ctx.fillStyle='#041018';
  for(const s of this.samples){const alpha=pixels[s.maskIndex+3]/255;if(alpha<.025)continue;ctx.globalAlpha=Math.min(.58,alpha*1.9);ctx.fillText(alpha>.15?'o':alpha>.07?':':'.',s.x,s.y);}ctx.globalAlpha=1;
 }
 _surface(){
  const a=this.wave.current,n=this.wave.cols,ctx=this.ctx;
  for(const s of this.samples){
   const k=s.k,h=a[k],dx=a[k+1]-a[k-1],dz=a[k+n]-a[k-n],light=dx*.35+dz*.78;
   const alpha=Math.min(.72,Math.abs(light)*15+Math.abs(h)*2.8)*(.75+s.noise*.25);if(alpha<.035)continue;
   const ax=Math.abs(dx),az=Math.abs(dz),glyph=az>ax*1.35?(Math.abs(h)>.045?'~':'-'):ax>az*1.35?':':dx*dz>0?'/':'\\';
   ctx.globalAlpha=alpha;ctx.fillStyle=light>=0?'#b1c4c9':'#687e86';ctx.fillText(glyph,s.x,s.y);
  }ctx.globalAlpha=1;
 }
 draw(){
  const ctx=this.ctx;ctx.setTransform(this.dpr,0,0,this.dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle=this.base;ctx.fillRect(0,0,this.width,this.height);
  ctx.font=`500 ${this.glyphSize}px ui-monospace,Menlo,Consolas,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';this._asciiShadows();
  // Broad reflected storm light, without a skyline or drawn cloud outlines.
  const drift=Math.sin(this.time*.018)*this.width*.08;
  const light=ctx.createRadialGradient(this.width*.46+drift,this.height*.16,0,this.width*.46+drift,this.height*.16,this.width*.7);light.addColorStop(0,'rgba(126,147,147,.045)');light.addColorStop(1,'rgba(126,147,147,0)');ctx.fillStyle=light;ctx.fillRect(0,0,this.width,this.height);
  this._surface();
  ctx.fillStyle='#a8bdc5';
  for(const drop of this.rain){const p=drop.age/drop.duration,end=drop.z*FLAT-(1-p)*drop.fall,x=drop.x+(1-p)*drop.drift;for(let q=0;q<drop.length;q+=this.glyphSize*.9){ctx.globalAlpha=drop.alpha*(1-q/drop.length*.65);ctx.fillText('|',x,end-q);}}
  for(const splash of this.splashes){const f=1-splash.age/splash.life;ctx.globalAlpha=f*.35;ctx.fillText(splash.age<.045?'+':'.',splash.x,splash.y);}
  ctx.globalAlpha=1;ctx.fillStyle=this.edge;ctx.fillRect(0,0,this.width,this.height);
 }
 get pixelBytes(){return this.canvas.width*this.canvas.height*4+this.waveCanvas.width*this.waveCanvas.height*4;}
}
