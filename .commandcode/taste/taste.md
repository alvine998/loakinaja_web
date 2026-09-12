# Taste Profile

## Design & UI
- Prioritizes mobile responsiveness: explicitly asks for pages to be improved for mobile (mobile-first layouts, stacked headers, adequate touch targets) in the LoakinAja web app (Next.js + Tailwind). Confidence: 0.6

## Workflow
- Prefers NOT running full builds after changes (explicitly says "don't run build"); verify via typechecking (tsc --noEmit) / dev-server checks instead. Confidence: 0.6

## Communication
- Communicates with very short, terse, lowercase imperative instructions and provides minimal context beyond the IDE selection — often just a run-on description of the desired flow with no acceptance criteria (e.g., "improve token page for mobile responsive", "upload image at /jual must max 10 images and total is 10 MB", "when click Beli on Token it will direct to payment page, 1 token = Rp 1000, and waiting payment page, and success or failed payment page"). Confidence: 0.7
