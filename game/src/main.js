import {createWorld,updateWorld,interact,respawn,notify} from './world.js';
import {beginMission} from './missions.js';
import {createInput} from './input.js';
import {createRenderer} from './render.js';
import {createAudio} from './audio.js';
import {saveGame,loadGame} from './save.js';
import {stageShot} from './shots.js';
const canvas=document.getElementById('game'),w=createWorld(),input=createInput(canvas),audio=createAudio();
const params=new URLSearchParams(location.search),shot=params.get('shot');if(shot)stageShot(w,shot);
const renderer=createRenderer(canvas,w);let accumulator=0,last=performance.now(),frames=0,elapsed=0,autosave=0;const frameTimes=[];
function save(){notify(w,saveGame(w)?'PROGRESS SAVED / LOCAL DEVICE':'SAVE UNAVAILABLE');}
function load(){if(w.player.car){w.player.car.driver=null;w.player.car.parked=true;}if(loadGame(w)){w.police=[];w.guards=[];w.bullets=[];w.player.wanted=0;w.heat=0;w.arrest=0;w.map=false;w.screen='play';w.paused=false;w.briefing=w.mission<5;w.active=false;w.player.inCar=false;w.player.car=null;renderer.snap();notify(w,'SAVE RESTORED');}else notify(w,'NO SAVE FOUND');}
function action(a){audio.start();if(a==='new'){const city=w.city,settings=w.settings;Object.assign(w,createWorld());w.city=city;w.settings=settings;w.screen='play';w.paused=false;w.briefing=true;w.finale=false;w.mission=0;w.completed=0;w.checkpoint=0;Object.assign(w.player,{x:240,y:440,cash:450,health:100,armour:60,wanted:0,ammo:72,clip:12,inCar:false,car:null});renderer.snap();}
 else if(a==='load')load();else if(a==='save')save();else if(a==='accept'){beginMission(w);input.fire=false;audio.play('ui');}else if(a==='resume')w.paused=false;else if(a==='settings')w.paused=true;else if(a==='title'){w.screen='title';w.paused=false;w.briefing=false;}else if(a==='respawn')respawn(w);else if(a==='finish'){w.finale=false;saveGame(w);}else if(a==='volDown')w.settings.volume=Math.max(0,w.settings.volume-.1);else if(a==='volUp')w.settings.volume=Math.min(1,w.settings.volume+.1);else if(a==='sensDown')w.settings.sensitivity=Math.max(.5,w.settings.sensitivity-.1);else if(a==='sensUp')w.settings.sensitivity=Math.min(2,w.settings.sensitivity+.1);}
function handle(){for(const a of input.actions.splice(0)){if(a==='Click'){const p=input.pointer,b=renderer.buttons.find(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);if(b){action(b.action);input.fire=false;}else audio.start();continue;}
 if(a==='Escape'||a==='KeyP'){w.paused=!w.paused;input.fire=false;audio.start();continue;}if(a==='KeyK'){save();continue;}if(a==='KeyL'){load();continue;}if(a==='KeyT'&&w.paused){action('title');continue;}if(a==='KeyO'&&w.screen==='title'){action('settings');continue;}if(a==='Enter'||a==='Space'&&w.screen==='title'){if(w.paused)action('resume');else if(w.screen==='title')action('new');else if(w.screen==='wasted'||w.screen==='busted')action('respawn');else if(w.finale)action('finish');else if(w.briefing)action('accept');continue;}if(w.screen!=='play'||w.paused)continue;if(a==='KeyJ'&&w.mission<5){w.briefing=!w.briefing;input.fire=false;continue;}if(a==='KeyM'){w.map=!w.map;continue;}if(w.briefing||w.map)continue;if(a==='KeyE')interact(w);if(a==='KeyR'&&w.player.ammo>0&&w.player.clip<12)w.player.reload=1.2;}}
function frame(now){requestAnimationFrame(frame);const dt=Math.max(0,Math.min(.1,(now-last)/1000));last=now;handle();const aim=renderer.unproject(input.pointer.x,input.pointer.y);const aimBlend=Math.min(1,dt*24*w.settings.sensitivity);input.aim.x+=(aim.x-input.aim.x)*aimBlend;input.aim.y+=(aim.y-input.aim.y)*aimBlend;accumulator+=dt;
 if(!shot&&!w.map){while(accumulator>=1/60){updateWorld(w,input,1/60);accumulator-=1/60;}}else accumulator=0;
 if(w.saveRequested){saveGame(w);w.saveRequested=false;}autosave+=dt;if(autosave>20&&w.screen==='play'&&!w.demo){saveGame(w);autosave=0;}
 audio.update(w);const renderStart=performance.now();renderer.draw();w.renderMs=performance.now()-renderStart;frames++;elapsed+=dt;frameTimes.push(dt*1000);if(frameTimes.length>600)frameTimes.shift();if(shot&&frames>30)window.__shotReady=true;}
addEventListener('visibilitychange',()=>{if(document.hidden&&w.screen==='play'&&!w.demo)w.paused=true;});
window.game={world:w,input,renderer,audio,action,step:(n=1)=>{for(let i=0;i<n;i++)updateWorld(w,input,1/60);},get metrics(){const sorted=[...frameTimes].sort((a,b)=>a-b);return {frames,elapsed,fps:frames/elapsed,p95ms:sorted[Math.floor(sorted.length*.95)]||0,entities:w.cars.length+w.police.length+w.people.length};}};
document.getElementById('status').textContent='Neon Meridian. Press Enter to start. WASD to move. E to enter a car.';
requestAnimationFrame(frame);
