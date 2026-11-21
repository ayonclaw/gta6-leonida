// A hand-shaped, original coastal city. Geometry is shared by collision, traffic and map rendering.
export const W=2640,H=1920;
export const XS=[240,640,1040,1440,1840,2240], YS=[240,640,1040,1440,1840];
export const districts=[{name:'GLASS QUARTER',sub:'Finance • after hours',x:0,y:0,w:1210,h:880,color:'#3c5558'},{name:'MARROW DOCKS',sub:'Freight • restricted',x:1210,y:0,w:1210,h:880,color:'#545b50'},{name:'CINDER HEIGHTS',sub:'Residential • hillside',x:0,y:880,w:1210,h:1040,color:'#496653'},{name:'SOLARA STRIP',sub:'Beachfront • nightlife',x:1210,y:880,w:1210,h:1040,color:'#696554'}];
export const shops=[{x:640,y:1140,name:'PATCH / REPAIR',kind:'repair',cost:160},{x:440,y:640,name:'FIRST LIGHT / CLINIC',kind:'health',cost:100},{x:1840,y:1240,name:'THREAD / ARMOUR',kind:'armour',cost:200},{x:1040,y:1640,name:'NIGHT MARKET / AMMO',kind:'ammo',cost:80}];
export function districtAt(x,y){return districts.find(d=>x>=d.x&&x<d.x+d.w&&y>=d.y&&y<d.y+d.h)||districts[3];}
export function makeCity(){const buildings=[],palms=[],lamps=[],containers=[];let n=0;
 for(let ix=0;ix<XS.length-1;ix++)for(let iy=0;iy<YS.length-1;iy++){
 const x=XS[ix]+75,y=YS[iy]+75;const dock=ix>=3&&iy<2, suburb=ix<3&&iy>=2;
 if(dock){buildings.push({x:x+12,y:y+10,w:218,h:105,z:38,color:'#637779',roof:'#8a9b8e',sign:ix===3&&iy===0?'MARROW / FREIGHT':'BONDED STORAGE',district:1});for(let k=0;k<4;k++)containers.push({x:x+10+k*59,y:y+160,w:46,h:87,c:['#ca795b','#438d95','#d1ac60','#707fa0'][k]});}
 else if(suburb){for(let k=0;k<4;k++)buildings.push({x:x+(k%2)*132,y:y+Math.floor(k/2)*133,w:87,h:78,z:28+(k%2)*7,color:['#c8a58a','#8eac9d','#c8b8a1','#a99dba'][k],roof:'#7e6963',sign:'',district:2});}
 else {const tower=ix<3&&iy<2;buildings.push({x:x+12,y:y+8,w:112,h:145,z:tower?75+(ix*27+iy*17)%85:35,color:tower?'#698888':'#c09a8b',roof:tower?'#809b98':'#dab69b',sign:['LUMEN','MIRA HOTEL','OASIS 24','KITE CLUB'][n++%4],district:tower?0:3});buildings.push({x:x+155,y:y+40,w:89,h:176,z:tower?55+(ix*13+iy*29)%60:46,color:tower?'#577c84':'#b2879f',roof:tower?'#6f949b':'#d4acc1',sign:tower?'':'SOLARA',district:tower?0:3});}
 }
 for(const x of XS)for(let y=130;y<1900;y+=150){palms.push({x:x+58,y});if(y%300===130)lamps.push({x:x-59,y:y+40});}
 for(let y=120;y<1900;y+=110)palms.push({x:2420,y});
 return {buildings,palms,lamps,containers};}
export function solid(city,x,y,r=10){if(x<35||y<35||x>2475||y>1890)return true;return city.buildings.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)||city.containers.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);}
export function lineClear(city,a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.ceil(d/25);for(let i=1;i<steps;i++)if(solid(city,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,0))return false;return true;}
export function nearestRoad(x,y){let best={x:240,y:240},d=Infinity;for(const xx of XS)for(const yy of YS){const dd=Math.hypot(x-xx,y-yy);if(dd<d){d=dd;best={x:xx,y:yy};}}return best;}
export function nextNode(node,dir,turn=0){let ix=XS.indexOf(node.x),iy=YS.indexOf(node.y);let nd=(dir+turn+4)%4;for(let j=0;j<4;j++){const dx=[1,0,-1,0][nd],dy=[0,1,0,-1][nd];if(ix+dx>=0&&ix+dx<XS.length&&iy+dy>=0&&iy+dy<YS.length)return {node:{x:XS[ix+dx],y:YS[iy+dy]},dir:nd};nd=(nd+1)%4;}return {node,dir};}
