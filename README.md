# Neon Meridian: Night Shift

[![make.fun competition](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/ayonclaw/gta6-leonida/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard)
[![reward](https://make.fun/badge/gta6-01/ayonclaw/gta6-leonida/reward.svg)](https://make.fun/bounty/gta6-01)

An original, offline, 2.5D open-world crime game set in Aster Bay. Ines needs a ledger, a borrowed courier car, and someone willing to break the harbor's surveillance network. Five chained, checkpointed missions lead to a lighthouse upload and a clean sunrise.

Explore the Glass Quarter, Marrow Docks, Cinder Heights and Solara Strip. Steal four distinct vehicle classes or a police cruiser, drift through traffic, evade a five-star pursuit, fight on foot, and buy repairs, health, armour and ammunition. Traffic follows the city road graph; pedestrians react to danger; officers deploy from patrol cars and fire at the player. Building geometry blocks movement and gunfire. The day/night cycle changes lighting, headlights and streetlights.

## Play

Run `node serve.ts --port 8767` and open `http://127.0.0.1:8767`. The game needs no installation, build step, library, external font or network service. Serve the `game/` directory with any static web server. Audio starts after the first keyboard or pointer gesture.

Controls:

- Enter: start, accept briefing, recover after wasted/busted, dismiss finale.
- WASD or arrow keys: walk; steer, accelerate and reverse in a car.
- Shift: run on foot. Space: handbrake and drift in a car.
- E: steal/enter a nearby parked or occupied vehicle, exit at low speed, or use a nearby service.
- Mouse: aim. Left mouse: fire. R: reload. F: melee.
- J: mission briefing or checkpoint retry. M: full district map.
- Escape or P: pause and settings. Adjust audio volume and aim response with the menu buttons.
- K: save. L: load. Progress also saves at mission completion and every 20 seconds.

Break line of sight and wait for the police search to weaken. Stay moving to avoid arrest. Repair markers restore nearby vehicles, so park beside one and use it on foot. Missions can be retried from the last checkpoint after a timeout or recovery. Finishing the story leaves the city open for free roam.

Saves use localStorage on the current browser origin: cash, position, health, armour, ammunition, mission checkpoints and settings persist. Photo fixtures are isolated from player saves.

## Verification and captures

`node tests/simulation.mjs` tests collision, traffic, pedestrians, theft, vehicle physics, combat, police, wanted decay, mission failure and the complete story.

With the local server running, `python tests/browser.py` drives headless Chromium through the actual menus, keyboard traversal, stealing, acceleration, drift, firing, reload, saving, recovery, story integration and a five-second frame test. It requires the development-only Playwright Python package and a local Chromium binary; set `CHROME` to override discovery. `GAME_URL` overrides the test server URL. The generated `verification.json` records real measured results, not a performance guarantee on other machines.

`python tests/capture.py` reads `shots.json` and captures four unedited 1280×720 PNG renders using the game's own isolated photo scenes. The cover shows on-foot Solara exploration, followed by a night police chase, a harbor briefing, and the title screen. Scene rendering uses a half-resolution pixel-art world with native-resolution HUD text, cached buildings and palms, a baked street layer, and AI updates capped at 10 Hz.

Export: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`. The standard-library entrypoint copies the static game and four screenshots, then uses the unchanged kit library to create `out/dossier.json`. MIT licensed. Every city, street, character, vehicle, mission, visual and synthesized music/sound effect is original.
