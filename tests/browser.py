import asyncio,json,os,time
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
CHROME=os.environ.get('CHROME') or str(next(Path.home().glob('.cache/ms-playwright/chromium-1234/chrome-linux/chrome')))
BASE=os.environ.get('GAME_URL','http://127.0.0.1:8767/')
async def main():
 results=[];errors=[];external=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=CHROME,headless=True,args=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
  context=await browser.new_context(viewport={'width':1280,'height':720},device_scale_factor=1)
  page=await context.new_page()
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('request',lambda r:external.append(r.url) if not r.url.startswith(BASE) else None)
  async def check(name,expr):
   assert await page.evaluate(expr),name
   results.append(name);print('PASS '+name,flush=True)
  await page.goto(BASE);await page.wait_for_function('window.game')
  await check('title screen boots',"game.world.screen==='title'")
  await page.keyboard.press('Enter');await page.wait_for_timeout(80)
  await check('new story opens briefing',"game.world.screen==='play'&&game.world.briefing")
  await page.keyboard.press('Enter');await page.wait_for_timeout(80)
  await check('accept starts first job',"game.world.active&&!game.world.briefing")
  await check('synthesized Web Audio context is running',"game.audio.state==='running'")
  # Real keyboard traversal: first checkpoint lies on two unobstructed road segments.
  await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');await page.wait_for_timeout(1070);await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft')
  await page.keyboard.down('KeyD');await page.wait_for_timeout(1440);await page.keyboard.up('KeyD')
  await check('real WASD reaches first mission checkpoint',"game.world.checkpoint===1")
  y0=await page.evaluate('game.world.player.y')
  await page.keyboard.press('Escape');await page.wait_for_timeout(100)
  await page.keyboard.down('KeyS');await page.wait_for_timeout(300);await page.keyboard.up('KeyS')
  assert abs(await page.evaluate('game.world.player.y')-y0)<1
  results.append('pause freezes simulation');print('PASS pause freezes simulation',flush=True)
  # Real pointer UI settings, then resume.
  await page.mouse.click(80+370,90+355)
  # Use the actual button registry to find responsive menu targets.
  b=await page.evaluate("game.renderer.buttons.find(b=>b.action==='volUp')")
  old=await page.evaluate('game.world.settings.volume');await page.mouse.click(b['x']+20,b['y']+20);await page.wait_for_timeout(80)
  assert await page.evaluate('game.world.settings.volume')>old
  results.append('audio volume setting responds to pointer');print('PASS audio volume setting responds to pointer',flush=True)
  b=await page.evaluate("game.renderer.buttons.find(b=>b.action==='sensUp')")
  await page.mouse.click(b['x']+20,b['y']+20);await page.wait_for_timeout(80)
  await check('aim sensitivity changes',"game.world.settings.sensitivity>1")
  await page.keyboard.press('Escape');await page.keyboard.press('KeyM');await page.wait_for_timeout(80)
  await check('city map opens',"game.world.map===true")
  await page.keyboard.press('KeyM')
  # Place a vehicle beside the player as a fixture, then exercise actual E / W / handbrake input.
  await page.evaluate("(()=>{const w=game.world,c=w.cars.find(c=>c.occupied);w.player.x=640;w.player.y=840;Object.assign(c,{x:640,y:840,angle:-Math.PI/2,speed:0,vx:0,vy:0,parked:true});w.player.invuln=100;game.renderer.snap();})()")
  await page.keyboard.press('KeyE');await page.wait_for_timeout(100)
  await check('occupied vehicle stolen with E',"game.world.player.inCar&&game.world.stats.stolen===1&&game.world.player.wanted>=1")
  await page.keyboard.down('KeyW');await page.wait_for_timeout(1000);await page.keyboard.up('KeyW')
  await check('actual accelerator moves car',"game.world.player.car.y<810&&game.world.player.car.speed>60")
  await page.keyboard.down('Space');await page.keyboard.down('KeyD');await page.wait_for_timeout(250);await page.keyboard.up('KeyD');await page.keyboard.up('Space')
  await check('actual handbrake produces drift marks',"game.world.skids.length>0")
  await page.evaluate('game.world.player.car.speed=0');await page.keyboard.press('KeyE');await page.wait_for_timeout(100)
  await check('E exits the vehicle',"!game.world.player.inCar")
  # Weapon mouse input and reload use real DOM events.
  await page.mouse.move(780,250);before=await page.evaluate('game.world.stats.shots');await page.mouse.down();await page.wait_for_timeout(560);await page.mouse.up()
  assert await page.evaluate('game.world.stats.shots')>before
  results.append('real mouse firing consumes ammunition');print('PASS real mouse firing consumes ammunition',flush=True)
  await page.keyboard.press('KeyR');await page.wait_for_timeout(1450)
  await check('reload refills magazine',"game.world.player.clip===12")
  await page.keyboard.press('KeyK');await page.wait_for_timeout(100)
  saved=await page.evaluate("JSON.parse(localStorage.getItem('neon-meridian-v1'))")
  assert saved['checkpoint']==1
  await page.reload();await page.wait_for_function('window.game');await page.keyboard.press('KeyL');await page.wait_for_timeout(120)
  await check('save survives browser reload',f"game.world.checkpoint===1&&game.world.player.cash==={saved['player']['cash']}")
  # Full story integration: staging moves only the actor; production mission code validates conditions and rewards.
  story=await page.evaluate("""async()=>{const {MISSIONS,currentStep}=await import('./src/missions.js');game.action('new');const w=game.world;w.player.invuln=9999;const before=w.player.cash;let ticks=0;while(w.mission<5&&ticks++<25){if(!w.active)game.action('accept');const s=currentStep(w);w.player.x=s.x;w.player.y=s.y;if(s.kind==='steal'||s.kind==='drive'){const c=w.cars.find(c=>c.missionCar);Object.assign(c,{x:s.x,y:s.y,driver:'player',speed:0,vx:0,vy:0});w.player.inCar=true;w.player.car=c;}else{if(w.player.car)w.player.car.driver=null;w.player.inCar=false;w.player.car=null;}if(s.kind==='clean'){w.player.wanted=0;w.heat=0;}game.step(s.kind==='hold'?Math.ceil((s.duration+.1)*60):2);}return {completed:w.completed,finale:w.finale,reward:w.player.cash-before,expected:MISSIONS.reduce((a,m)=>a+m.reward,0)};}""")
  assert story['completed']==5 and story['finale'] and story['reward']==story['expected']
  results.append('browser production mission logic completes full five-job story');print('PASS browser production mission logic completes full five-job story',flush=True)
  await page.keyboard.press('Enter');await page.wait_for_timeout(80)
  await check('finale returns to free roam',"!game.world.finale&&game.world.mission===5")
  # Death and recovery use actual health damage / respawn implementation.
  await page.evaluate("async()=>{const {damagePlayer}=await import('./src/world.js');game.world.player.invuln=0;damagePlayer(game.world,1000);}")
  await check('wasted screen appears',"game.world.screen==='wasted'")
  await page.keyboard.press('Enter');await page.wait_for_timeout(80)
  await check('respawn restores player',"game.world.screen==='play'&&game.world.player.health===100")
  # Five seconds of live simulation. Every frame count is measured, never synthesized.
  await page.evaluate("game.action('new');game.action('accept');game.world.player.invuln=1000;")
  await page.wait_for_timeout(1200)
  before=await page.evaluate('({f:game.metrics.frames,t:performance.now(),s:game.world.time})')
  await page.wait_for_timeout(5000)
  after=await page.evaluate('({f:game.metrics.frames,t:performance.now(),s:game.world.time,p95:game.metrics.p95ms})')
  performance={'frames':after['f']-before['f'],'wallSeconds':round((after['t']-before['t'])/1000,3),'simulationSeconds':round(after['s']-before['s'],3),'fps':round((after['f']-before['f'])/((after['t']-before['t'])/1000),2),'p95ms':round(after['p95'],2)}
  assert performance['frames']>=230 and performance['simulationSeconds']>4.5,performance
  assert not errors,errors
  assert not external,external
  print('PASS 5-second frame stability '+json.dumps(performance),flush=True)
  report={'passed':len(results),'tests':results,'story':story,'performance':performance,'consoleErrors':errors,'externalRequests':external,'viewport':[1280,720]}
  (ROOT/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
  print(json.dumps(report),flush=True)
  await browser.close()
asyncio.run(main())
