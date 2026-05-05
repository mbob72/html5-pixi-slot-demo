# pixi-slot-demo

A small HTML5 slot game demo built with TypeScript, Vite, and PixiJS.

## Why this project exists

This project is a portfolio-oriented technical showcase for Frontend Game Developer roles in iGaming and HTML5 games. It focuses on canvas/WebGL rendering, animation-heavy UI, clean state flow, responsive layout, and maintainable TypeScript architecture.

This is not a real-money gambling product.

## Tech stack

- Vite
- TypeScript in strict mode
- PixiJS
- ESLint
- Prettier
- HTML/CSS overlay for page shell and debug output

## Features

- 5 reels and 3 visible rows
- Single center payline
- SPIN button with disabled state during reel animation
- Balance, bet, and last win display
- Increase/decrease bet controls
- Staggered reel stops
- Generated local symbol textures
- Winning symbol pulse/glow animation
- Win banner
- Loading screen before gameplay
- Responsive scaling for desktop and mobile viewports
- Sound toggle placeholder with a clear extension point
- Optional debug panel via `?debug=true`

## Game logic

Symbols:

- `CHERRY`
- `LEMON`
- `BAR`
- `SEVEN`
- `DIAMOND`
- `WILD`

Payline:

- One horizontal center line
- Left-to-right evaluation
- `WILD` substitutes for any symbol

Payouts:

- 3 matching symbols: bet x 2
- 4 matching symbols: bet x 5
- 5 matching symbols: bet x 10

## Architecture overview

```text
src/
  main.ts
  game/
    GameApp.ts
    GameScene.ts
    Reel.ts
    SymbolView.ts
    state/
      GameStateMachine.ts
      types.ts
    logic/
      slotMath.ts
      paytable.ts
      rng.ts
    ui/
      Button.ts
      TextPanel.ts
      WinBanner.ts
    assets/
      createSymbolTextures.ts
    utils/
      resize.ts
      ticker.ts
```

The slot math is isolated from PixiJS rendering. The game state machine owns balance, bet, status, and result settlement. PixiJS classes render reels, symbols, buttons, panels, loading, and win presentation.

## How to run

Use Node.js 18.18+.

```bash
npm install
npm run dev
```

Open the local Vite URL in the browser.

Debug mode:

```text
http://localhost:5173/?debug=true
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## What could be improved next

- Add real audio assets and a dedicated sound manager implementation
- Add configurable reel strips and weighted RNG
- Add more paylines and a visual paytable screen
- Add automated tests for slot math and state transitions
- Add asset preloading with progress reporting
- Add richer screen transitions and mobile-specific control layout

## Note

This is a portfolio demo. It does not include real-money gambling, backend integration, or production casino certification.
