// Reproducible, isolated photo fixtures use the same entities, rules and renderer as normal play.
import {TYPES,crime} from './world.js';
import {beginMission} from './missions.js';
export function stageShot(w,name){w.demo=true;w.screen='play';w.clock=18.7;w.player.cash=2850;w.player.health=92;w.player.armour=65;
 if(name==='street'){Object.assign(w.player,{x:2180,y:1550,angle:-.4});w.mission=4;w.active=true;w.timer=135;w.checkpoint=0;w.toast='SOLARA STRIP / THE CITY NEVER GOES QUIET';w.toastTime=4;const car=w.cars[0];Object.assign(car,{x:2240,y:1510,angle:Math.PI/2,parked:true,occupied:true});}
 if(name==='chase'){w.mission=3;w.checkpoint=1;beginMission(w);w.clock=20.8;const car=w.cars.find(c=>c.missionCar);Object.assign(car,{x:1440,y:1030,angle:-.2,speed:220,vx:210,vy:-40,driver:'player'});Object.assign(w.player,{x:car.x,y:car.y,inCar:true,car,wanted:3,angle:car.angle});w.heat=15;w.seen=true;for(let i=0;i<3;i++){const t={name:'Sentinel Patrol',color:'#e4e8df',length:61,width:30,max:230,acc:200,grip:7};w.police.push({id:200+i,x:car.x-130-i*85,y:car.y+8+(i%2)*12,type:t,angle:-.2,speed:180,vx:180,vy:-30,health:100,police:true,shoot:1,driver:null});}for(let i=0;i<18;i++)w.skids.push({x:car.x-i*9,y:car.y+Math.sin(i*.13)*35,a:-.2,life:8});w.toast='BREAK LINE OF SIGHT / EVIDENCE ON BOARD';w.toastTime=4;}
 if(name==='briefing'){w.mission=2;w.player.x=1840;w.player.y=440;w.player.angle=-1;w.clock=17.9;w.briefing=true;w.active=false;w.player.cash=1650;}
 if(name==='sunrise'){w.mission=4;w.checkpoint=2;w.active=true;w.timer=140;w.clock=6.7;w.player.x=2240;w.player.y=1660;w.player.cash=4970;w.player.angle=-Math.PI/2;w.toast='UPLINK COMPLETE / MAKE THE LAST CROSSING';w.toastTime=4;}
 if(name==='start'){w.screen='title';w.player.x=2180;w.player.y=1155;w.clock=18.2;}
 w.time=2;
}
