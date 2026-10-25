# Space Ninja — Hub Data bridge

This is the Space Ninja project with the Hub's Data bridge added. The game is
still blocks-first: `main.blocks` is untouched and `main.ts` is still generated
from it. The bridge is three files.

## What changed

| File | Change |
| --- | --- |
| `hub.ts` | **New.** Reads the run's score, boss kills, final boss and lives; reports a finished run to the Hub; shows the run summary. |
| `assets/js/custom.js` | **Filled in.** The exported build's hook. Forwards the game's report to the Hub page and the Hub's reply back into the simulator. |
| `pxt.json` | Adds `hub.ts` to `files`, and `"disableTargetTemplateFiles": true` so MakeCode stops overwriting `custom.js`. |

Nothing else is touched. `main.blocks`, `main.ts`, the images and the tilemap
are exactly as they were.

## How it works

The game runs in an iframe on GitHub Pages. It cannot read the Hub's session,
storage or DOM, and it never sees a password, a JWT or a Supabase key.

```text
Space Ninja (hub.ts)
    control.simmessages.send("hub", …)
        ↓
assets/js/custom.js
    window.parent.postMessage(…)
        ↓
Hub Games page (the-hub-staging.pages.dev/games)
    checks the Hub session, opens the game session
        ↓
game-data Edge Function
    computes the reward, writes profiles.data_bytes
```

The game receives a callsign and whether the run can earn. That is all. The
Hub computes the Data on its server from the numbers the game sent, so a
modified game can lie about a run but cannot choose its own reward.

### The reward rule

**1 unit = 64 bytes**

```text
score_counted = final_boss ? 1,000,000 : the score at the end of the run

units = floor(score_counted / 100,000)
      + duck_kills
      + (2 × monkey_kills)
      + (final_boss ? 10 + lives_at_end : 0)

Data = units × 64
```

- **Space Duck:** 1 unit (64 bytes)
- **Space Monkey:** 2 units (128 bytes)
- **Final boss A M O G U S:** 10 units (640 bytes)
- **Each life left after the final boss:** 1 unit (64 bytes)
- The final boss's own `9,999,999` is a joke score and is **never** used. A boss
  run counts as 1,000,000 for the score chunks.
- One earning run per game per day (UTC). Later runs that day are fun-only; the
  game shows them as such and the server records them without paying.

A boss run is worth `10 score units + 10 boss units + 1 per life left + the
ducks and monkeys killed in that run`.

### The message protocol

The game side has no JSON, so it uses plain text. `custom.js` wraps the
outbound half in JSON because the exported loader parses every sim message as
JSON before handing it to the handler.

```text
game → hub   {"v":1,"action":"ready"}
             {"v":1,"action":"progress","run":{"score":…,"duck":…,"monkey":…,"final_boss":0|1,"lives":…}}
             {"v":1,"action":"run","run":{"score":…,"duck":…,"monkey":…,"final_boss":0|1,"lives":…}}
             {"v":1,"action":"summary_shown"}
             {"v":1,"action":"summary_seen"}

hub → game   HUB1|SESSION|earning|callsign
             HUB1|SUMMARY|data_awarded|earning|line~line~line
```

`progress` is the live chip's projection; it is sent only when the run's
projected unit count changes (a 100K step, a kill), not every frame. The
server still prices the final `run`.

`summary_shown` is sent just before the game's fullscreen long text opens, so
the Hub holds its own panel back for as long as the player reads. `summary_seen`
is sent when that dialog is dismissed, and the Hub then shows its detailed
panel. If neither ever arrives, the Hub falls back to its panel after 15 s.

## Publishing

This folder already contains the compiled web build, so nothing has to be
rebuilt to go live: `assets/js/binary.js` was built from this source with the
arcade target, and `assets/js/custom.js` is the bridge.

1. Copy these five files over the same paths in
   <https://github.com/ayoub-youssef/space-ninja>:
   - `hub.ts`
   - `pxt.json`
   - `assets/js/custom.js`
   - `assets/js/loader.js`
   - `assets/js/binary.js`
2. Commit and push.
3. Hard-refresh <https://ayoub-youssef.github.io/space-ninja/> once. The page's
   `?v=` query is Jekyll's build revision, so it changes with the push and new
   visitors pick the build up as Pages rebuilds (usually under a minute).

The MakeCode editor route still works for later edits: open the project,
commit, and create a release. `pxt.json`'s `disableTargetTemplateFiles` keeps
`custom.js` from being replaced by the stock template.

The Hub passes `?hub_origin=` on the URL. `custom.js` only accepts messages
from that origin, so framing the game elsewhere leaves the bridge inert.

The Hub also passes `?hideconsole=1` on a mouse/keyboard device. `loader.js`
turns that into the simulator's own `hideSimButtons=1&noExtraPadding=1`, so the
framed game is the 4:3 screen alone, with no console chrome. A touch device
keeps the console, because the on-screen D-pad and A/B buttons are the only
controls there. Keyboard: arrows or WASD to move, Space for A, Enter for B.

## Testing without a rebuild

The Hub has a stand-in game page at `games/_test/bridge.html`. On a local
server, open:

```text
http://localhost:8000/games?game=/games/_test/bridge.html
```

It sends `ready` and offers a normal run and a boss run, so the whole Hub side
— login, session, payout, summary — can be exercised before the real export is
rebuilt. The override only works on localhost.
