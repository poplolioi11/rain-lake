import {RainScene} from './scene.js?v=0.1.0';
const canvas=document.getElementById('lake'),FPS=24,INTERVAL=1000/FPS;
const scene=new RainScene(canvas,{width:innerWidth,height:innerHeight,dpr:devicePixelRatio||1});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let visible=!document.hidden,paused=reduced.matches,raf=0,last=0,next=0,pending=0,frames=0;
canvas.dataset.targetFps=String(FPS);canvas.dataset.cameraDegrees='45';
function draw(){const t=performance.now();scene.draw();canvas.dataset.renderMs=(performance.now()-t).toFixed(2);canvas.dataset.frameCount=String(++frames);canvas.dataset.waveNodes=String(scene.wave.cols*scene.wave.rows);canvas.dataset.impacts=String(scene.impactCount);canvas.dataset.pixelBytes=String(scene.pixelBytes);}
function frame(now){
 raf=0;if(!visible||paused)return;
 if(last)pending+=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
 if(now+.01>=next){let remaining=pending;pending=0;while(remaining>1e-7){const dt=Math.min(1/30,remaining);scene.step(dt);remaining-=dt;}draw();if(!next)next=now;do{next+=INTERVAL;}while(next<=now);}
 raf=requestAnimationFrame(frame);
}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;next=0;pending=0;}
function start(){if(!raf&&visible&&!paused)raf=requestAnimationFrame(frame);}
document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)start();else stop();});
reduced.addEventListener('change',()=>{paused=reduced.matches;if(paused)stop();else start();});
addEventListener('resize',()=>{scene.resize(innerWidth,innerHeight,devicePixelRatio||1);draw();});
draw();start();
