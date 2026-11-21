[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/nexrodestro/nexro-gta6-trophy-guide-3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/nexrodestro/nexro-gta6-trophy-guide-3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Checklist — GTA VI

An offline web app that covers all 55 PlayStation 5 trophies of Grand Theft Auto VI: each trophy's official name, description and grade, a guide written for this page with its sources named, and a short practical tip — plus a checklist that remembers your progress, filters, a spoiler mode, a platinum roadmap, and the missable flags.

Part of the [gta6-trophy-guide-01 competition on make.fun](https://make.fun/c/gta6-trophy-guide-01).

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests, no external fonts or libraries — system fonts only. The screenshots were taken at 1280×800 with a demo checklist (see `shots.py`).

Deep links preset the view: `?spoiler=off` shows story trophies, `?grade=silver` filters to silver, `?q=Positive%20Mental%20Attitude` searches, and `#cards` jumps straight to the trophy list.

## The trophy list

| Grade | Count |
| --- | --- |
| Platinum | 1 |
| Gold | 2 |
| Silver | 6 |
| Bronze | 46 |

Names, descriptions and grades match the official list exactly. 28 trophies are flagged hidden and 1 is flagged missable.

## Inside the app

- **A guide for every trophy:** what to do, where, and when it can be missed — written in our own words, each citing its sources (KeenGamer, PowerPyx, ofzenandcomputing, plus the official descriptions). Where a method is still unconfirmed at launch, the guide says so plainly instead of inventing a walkthrough.
- **A tip per trophy:** one extra line of practical advice beside each guide — the efficient spot, the right time, or the thing to do first.
- **A tracker that remembers:** tick a trophy off and it stays ticked (localStorage). A progress bar, per-grade counts and per-step counts show where you stand. Export progress as JSON, import it back, reset when starting over.
- **Filters:** search, grade, kind (story / missable / collectibles / activities / online / chapter / mission / side character / robbery / combat / exploration / misc), roadmap step, earned vs remaining.
- **Spoiler mode:** on by default — story (hidden) trophies show as "Hidden Trophy" until you earn them, then the guide reveals itself.
- **Platinum roadmap:** Step 1 story (60–80h) → Step 2 100% completion (~100h) → Step 3 cleanup (10–20h). About 200 hours total, difficulty 4/10. One playthrough, no mission replay, no online trophies.
- **The missable one:** Positive Mental Attitude — the Chapter 1 balcony meditation with Lucia. Flagged in the guide and in a warning strip, with the exact steps.

## Hand in the entry

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That writes `out/dossier.json` plus `out/app` and `out/screenshots`. Before handing anything in, `main.ts` checks `app/data/trophies.json` (55 trophies, grade split 1/2/6/46, 28 hidden, every guide and tip non-blank and sourced) and the screenshots (3–4, each ≤ 256 KiB).

## License

MIT — see [LICENSE](LICENSE). No Rockstar Games logo, artwork, or fonts are used.
