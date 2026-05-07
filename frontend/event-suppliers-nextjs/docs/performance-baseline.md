# Performance Baseline

## Build Status

- `npm run build`: pass
- `npx next build --webpack`: pass
- App routes are generated successfully for all primary pages.

## Routes Checked (Plan Priority 0)

- `/`
- `/marketplace`
- `/supplier/dashboard`

## Notes

- This repository currently builds with Next.js `16.2.4`.
- Web vitals logging hook was added in `src/instrumentation-client.ts` so local/prod sessions can capture `LCP`, `INP`, and `CLS` payloads.
- Current build output (Next 16) does not print per-route JS size table in this setup; route generation output is captured from build logs.

## Next Measurement Step

- Run Lighthouse (mobile) against local production server:
  1. `npm run build`
  2. `npm run start`
  3. Audit `/`, `/marketplace`, `/supplier/dashboard`
