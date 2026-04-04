# BetterSettlers

A balanced Catan board generator, rebuilt from the original 2009 Flash application in modern web tech.

BetterSettlers generates fair game board layouts for Settlers of Catan that distribute resources and dice probabilities evenly, preventing games from being decided by an unbalanced board.

## Features

- **Fair Distribution** (default) — The "Better Settlers" algorithm ensures:
  - No same-resource adjacency
  - No duplicate probability numbers on the same resource type
  - Balanced probability spread per resource group
  - Intersection constraints (no duplicate numbers at vertices, bounded total probability)
  - Harbor fairness (2:1 harbors won't be next to high-probability matching resources)
- **Traditional Distribution** — Official Catan rulebook spiral placement method
- **Random Distribution** — Pure random shuffle with no constraints
- **Three board sizes** — Standard (3-4 players), Large (5 players), X-Large (6 players)
- **Shuffle controls** — Regenerate the full map, shuffle only numbers, or shuffle only harbors
- SVG hex board rendering with resource icons, number tokens, probability dots, and harbor indicators

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- SVG rendering (no canvas or external libs)
- All logic runs client-side (no backend)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Algorithm

The core generation algorithm is faithfully ported from the original ActionScript 3.0 source (`settlers_4.swf`, ~2195 lines of decompiled code). It uses a try/reject/restart pattern: resources and probabilities are placed one at a time with constraint checking, and if placement gets stuck, rejected items are recycled or the algorithm restarts from scratch.

Key files:
- `src/lib/constants.ts` — All board constants (grids, resources, probabilities) ported from the ActionScript
- `src/lib/board-generator.ts` — Core generation algorithm
- `src/components/HexBoard.tsx` — SVG hex board rendering
- `src/components/Controls.tsx` — UI controls

## History

Originally built as a Flash (SWF) application in 2008-2009. The Android app by Andrew Flynn on Google Play has 100K+ downloads with a 4.4-star rating. This is a complete rebuild using modern web technologies, with the generation algorithm faithfully ported from the decompiled ActionScript source.
