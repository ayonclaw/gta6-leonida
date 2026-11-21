import json,re,struct,subprocess,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
files=sorted(p for p in GAME.rglob('*') if p.is_file());entries=list(GAME.rglob('*'))
assert all(not p.is_symlink() for p in entries)
assert len(entries)<=993
size=sum(p.stat().st_size for p in files);assert size<48*1024*1024
assert (GAME/'index.html').stat().st_size<=1024*1024
modules=[p for p in files if p.suffix in ['.js','.mjs']]
for p in modules:
 subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
 for ref in re.findall(r"(?:from\s*|import\s*\()['\"]([^'\"]+)['\"]",p.read_text()):
  assert ref.startswith('.'),(p,ref)
  target=(p.parent/ref).resolve();assert target.is_relative_to(GAME) and target.is_file(),(p,ref)
print(f'PASS node --check: {len(modules)} JavaScript modules')
for p in files:
 text=p.read_text()
 assert not any(s in text for s in ['http://','https://','fetch(']),p
 assert len(str(p.relative_to(GAME)).encode())<=1000
print('PASS no external URL or fetch references under game/')
print(f'PASS static bundle: {len(files)} files, {len(entries)} entries, {size} bytes, no symlinks')
shots=json.loads((ROOT/'shots.json').read_text());screens=sorted((ROOT/'screenshots').iterdir());assert len(screens)==len(shots)==4
for p in screens:
 data=p.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n';assert struct.unpack('>II',data[16:24])==(1280,720);assert len(data)<=262144
print('PASS exactly four 1280x720 PNG screenshots, each below 256 KiB')
for sub in ['game','screenshots']:
 for src in (ROOT/sub).rglob('*'):
  if src.is_file():
   rel=src.relative_to(ROOT);assert digest(src)==digest(ROOT/'out'/rel)==digest(ROOT/'out-repeat'/rel),str(rel)
assert digest(ROOT/'out/dossier.json')==digest(ROOT/'out-repeat/dossier.json')
assert (ROOT/'out/dossier.json').stat().st_size<1536*1024
print('PASS two exports are byte-identical and every exported asset matches its source')
print('PASS out/dossier.json, out/game/index.html and out/screenshots exist')
result={'gameFiles':len(files),'gameEntries':len(entries),'gameBytes':size,'modulesParsed':len(modules),'screenshots':len(screens),'dossierBytes':(ROOT/'out/dossier.json').stat().st_size,'dossierSHA256':digest(ROOT/'out/dossier.json'),'exportsIdentical':True,'externalReferences':0}
(ROOT/'bundle-report.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
