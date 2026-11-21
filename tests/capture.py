import asyncio,json,os,struct
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
CHROME=os.environ.get('CHROME') or str(next(Path.home().glob('.cache/ms-playwright/chromium-1234/chrome-linux/chrome')))
BASE=os.environ.get('GAME_URL','http://127.0.0.1:8767/')
async def main():
 shots=json.loads((ROOT/'shots.json').read_text());assert 3<=len(shots)<=4
 out=ROOT/'screenshots';out.mkdir(exist_ok=True)
 for old in out.iterdir():
  if old.suffix.lower() in ['.png','.jpg','.jpeg']:old.unlink()
 report=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=CHROME,headless=True,args=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
  for shot in shots:
   page=await browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
   await page.goto(BASE+shot['query']);await page.wait_for_function('window.__shotReady && game.metrics.frames>=120')
   state=await page.evaluate("async()=>{const {currentStep}=await import('./src/missions.js');const s=currentStep(game.world);return {screen:game.world.screen,mission:game.world.mission+1,wanted:game.world.player.wanted,inCar:game.world.player.inCar,briefing:game.world.briefing,objective:s?game.renderer.project(s.x,s.y):null,player:game.renderer.project(game.world.player.x,game.world.player.y)};}")
   # Capture straight from Chromium. No resizing, compositing, palette edits, or postprocessing.
   path=out/shot['name'];await page.screenshot(path=str(path),type='png')
   data=path.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n';width,height=struct.unpack('>II',data[16:24]);assert (width,height)==(1280,720);assert len(data)<=262144,(path.name,len(data));assert not errors,errors
   if shot['query']=='?shot=street':assert 0<state['objective']['x']<1280 and 80<state['objective']['y']<660
   if shot['query']=='?shot=chase':assert state['wanted']>=3 and state['inCar']
   if shot['query']=='?shot=briefing':assert state['briefing']
   record={'name':path.name,'bytes':len(data),'dimensions':[width,height],'state':state,'consoleErrors':errors};report.append(record);print('PASS screenshot '+json.dumps(record),flush=True)
   await page.close()
  await browser.close()
 assert len(list(out.glob('*.png')))==len(shots)
 (ROOT/'capture-report.json').write_text(json.dumps(report,indent=2)+'\n')
asyncio.run(main())
