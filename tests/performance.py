import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
CHROME=os.environ.get('CHROME') or str(next(Path.home().glob('.cache/ms-playwright/chromium-1234/chrome-linux/chrome')))
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path=CHROME,headless=True,args=['--no-sandbox','--headless=new','--disable-dev-shm-usage','--disable-gpu'])
  page=await browser.new_page(viewport={'width':1280,'height':720},device_scale_factor=1)
  errors=[];requests=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  page.on('request',lambda r:requests.append(r.url))
  await page.goto('http://127.0.0.1:8767/')
  await page.wait_for_function('window.game')
  await page.keyboard.press('Enter');await page.keyboard.press('Enter')
  await page.wait_for_timeout(1500)
  before=await page.evaluate('({frames:game.metrics.frames,time:performance.now(),sim:game.world.time})')
  await page.wait_for_timeout(5000)
  after=await page.evaluate('({frames:game.metrics.frames,time:performance.now(),sim:game.world.time,p95:game.metrics.p95ms})')
  print(json.dumps({'errors':errors,'external_requests':[u for u in requests if not u.startswith('http://127.0.0.1:8767/')],'five_second_test':{'frames':after['frames']-before['frames'],'wall_seconds':(after['time']-before['time'])/1000,'sim_seconds':after['sim']-before['sim'],'fps':(after['frames']-before['frames'])/((after['time']-before['time'])/1000),'p95ms':after['p95'],'draw_ms':await page.evaluate('game.world.renderMs')}}))
  await browser.close()
asyncio.run(main())
