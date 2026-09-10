# Taste Profile

## Design & UI
- Prioritizes mobile responsiveness: explicitly asks for pages to be improved for mobile (mobile-first layouts, stacked headers, adequate touch targets) in the LoakinAja web app (Next.js + Tailwind). Confidence: 0.6

## Workflow
- Prefers NOT running full builds after changes (explicitly says "don't run build"); verify via typechecking (tsc --noEmit) / dev-server checks instead. Confidence: 0.6

## Communication
- Communicates with very short, terse, lowercase imperative instructions (e.g., "improve token page for mobile responsive", "upload image at /jual must max 10 images and total is 10 MB") and provides minimal context beyond the IDE selection (e.g., "beside form that will be preview of ads"). Confidence: 0.65
