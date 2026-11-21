// Five authored jobs form a complete story with resumable checkpoints and explicit failure conditions.
export const MISSIONS=[
 {name:'A SMALL FAVOR',contact:'INES / MECHANIC',brief:'I used to fix their engines. Now I know what is in their trucks. Pick up my ledger at the Glass Quarter kiosk. We are getting my brother out of Marrow tonight.',reward:450,time:150,steps:[{x:440,y:240,text:'Collect Ines’s ledger at the kiosk',kind:'reach'},{x:640,y:640,text:'Deliver the ledger to Ines’s garage',kind:'reach'}]},
 {name:'BORROWED HORSE',contact:'INES / MECHANIC',brief:'The harbor gate only opens for a courier. Borrow a coupe from Cinder Heights, then bring it to the freight checkpoint. Be gentle with it. Or at least leave the wheels on.',reward:750,time:190,steps:[{x:990,y:1130,text:'Steal the coral Vesper coupe [E]',kind:'steal'},{x:1840,y:640,text:'Drive the stolen coupe to Marrow Docks',kind:'drive'}]},
 {name:'DEAD FREQUENCY',contact:'RAFI / RADIO OPERATOR',brief:'They watch every road. The relay at the docks is the exception. Stand close and I will loop the camera feed. You will have to keep their guards off me.',reward:1100,time:180,steps:[{x:2040,y:240,text:'Reach the harbor signal relay',kind:'reach'},{x:2040,y:240,text:'Hold the relay for 12 seconds',kind:'hold',duration:12},{x:2240,y:1040,text:'Escape to Solara’s sea wall',kind:'reach'}]},
 {name:'NO BLUE LIGHTS',contact:'INES / MECHANIC',brief:'My brother is out. Their evidence is not. Take the freight manifest from the loading zone. Shake the police before you come to the house. No sirens at my door.',reward:1600,time:210,steps:[{x:1440,y:440,text:'Take the freight manifest',kind:'reach'},{x:640,y:1440,text:'Lose your wanted stars, then reach the safehouse',kind:'clean'}]},
 {name:'THE LAST TIDE',contact:'INES / MECHANIC',brief:'The manifest names every buyer. One upload at Solara’s old lighthouse and they cannot bury it. The gate crew is already coming. Finish the upload. Get us a clean sunrise.',reward:3200,time:210,steps:[{x:2240,y:1640,text:'Reach the lighthouse uplink',kind:'reach'},{x:2240,y:1640,text:'Defend the uplink for 18 seconds',kind:'hold',duration:18},{x:1840,y:1840,text:'Meet Ines at the last tide crossing',kind:'reach'}]}
];
export function currentStep(w){return MISSIONS[w.mission]?.steps[w.checkpoint]||null;}
export function beginMission(w){if(w.mission>=5)return;if(w.mission===1){const c=w.cars.find(c=>c.missionCar);if(c&&c.health<=0){Object.assign(c,{health:100,x:990,y:1130,speed:0,vx:0,vy:0,driver:null,parked:true,occupied:false});w.checkpoint=0;}}w.timer=w.active?w.timer:MISSIONS[w.mission].time;w.hold=w.active?w.hold:0;w.active=true;w.briefing=false;w.failed='';w.checkpoint=w.checkpoint||0;}
export function failMission(w,reason){if(!w.active)return;w.active=false;w.failed=reason;w.briefing=false;w.hold=0;w.toast='JOB FAILED — '+reason;w.toastTime=5;}
export function advanceMission(w,dt){if(!w.active)return;w.timer-=dt;if(w.timer<=0)return failMission(w,'The window closed. Press J to retry.');const s=currentStep(w),p=w.player,d=Math.hypot(p.x-s.x,p.y-s.y);let ok=false;
 if(s.kind==='reach')ok=d<54;
 if(s.kind==='steal')ok=p.inCar&&p.car.missionCar;
 if(s.kind==='drive')ok=d<65&&p.inCar&&p.car.missionCar;
 if(s.kind==='clean')ok=d<60&&p.wanted===0;
 if(s.kind==='hold'){if(d<120){w.hold+=dt;ok=w.hold>=s.duration;}else w.hold=Math.max(0,w.hold-dt*.5);}
 if(!ok)return;w.checkpoint++;w.hold=0;w.toast='CHECKPOINT REACHED';w.toastTime=2;if((w.mission===2&&w.checkpoint===1)||(w.mission===4&&w.checkpoint===1)){p.wanted=Math.max(p.wanted,w.mission===4?3:2);w.heat=18;}
 if(w.mission===3&&w.checkpoint===1){p.wanted=3;w.heat=18;}
 if(w.checkpoint>=MISSIONS[w.mission].steps.length){const job=MISSIONS[w.mission];p.cash+=job.reward;w.completed=w.mission+1;w.mission++;w.checkpoint=0;w.active=false;w.toast=`${job.name} / COMPLETE +$${job.reward}`;w.toastTime=6;w.briefing=w.mission<5;w.saveRequested=true;if(w.mission===5){w.finale=true;w.player.wanted=0;w.heat=0;}}
}
