# Computing Systems Arena

A dark, mobile-first revision arena for the Computing Systems course. Thirteen worlds, a quiz engine, mini-games, bosses, flashcards, and a timed mock. Progress stays in the browser.

**Live:** https://prafullj0shi.github.io/computing-systems-arena/

Questions and answers are AI-assisted study material, not official course content; verify against your course resources.

## Features

- World map for all 13 weeks, open together
- Practice quiz and multi-select, with the explanation and any trap after you answer
- XP and ten ranks, from Boot Loader to Systems Sage at 9,500 XP
- Daily streak, mistake vault, and a revision sprint that leads with weak topics
- 40-question timed mock, results by week, and a review screen
- One boss per prompt from the bank, unlocked at 70% mastery, self-graded on a 5-step rubric
- Flashcards with SM-2 spacing
- A short mini-game in every world
- Settings: reset, export and import progress, optional custom bank import

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/computing-systems-arena/`.

```bash
npm test
npm run lint
npm run build
```

The bundled bank is `content/bank/`. An optional overlay can live in gitignored `content/private/` or in `VITE_PRIVATE_CONTENT_DIR`. Importing a zip or JSON files from Settings stores that bank in this browser only.

## Stack

React, Vite, TypeScript, Tailwind. Static hosting on GitHub Pages. Hash routes, so a refresh survives Pages.
