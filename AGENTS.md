# Repository Guidelines

These guidelines describe how this repo is organized and how to contribute changes safely.

## Project Structure & Module Organization

- `gun.js`: primary distribution bundle (Node + browser entrypoints are wired via `index.js`/`browser.js`).
- `gun.min.js`: minified bundle (keep in sync when changing `gun.js`).
- `src/`: split-out source modules (often regenerated from `gun.js` via `npm run unbuild`).
- `lib/`: server adapters/utilities and build/release helpers (for example `lib/unbuild.js`).
- `sea/`: SEA (security/encryption) modules and bundle (`sea.js`, `sea.d.ts`).
- `types/`, `*.d.ts`: TypeScript definitions; `tsconfig.json` is configured to typecheck declarations.
- `test/`: Mocha tests (Node + browser fixtures); `examples/`: runnable demos and integration examples.

## Build, Test, and Development Commands

- `npm ci`: install dependencies from `package-lock.json`.
- `npm start`: run the example HTTP server (`examples/http.js`).
- `npm test`: run the Mocha test suite used in CI.
- `npm run testsea`: run SEA-specific tests (`test/sea/sea.js`).
- `npm run https`: run `npm start` with test TLS certs from `test/https/`.
- `npm run minify`: regenerate `gun.min.js` from `gun.js` (UglifyJS).
- `npm run unbuild`: regenerate `src/` from the current bundle and minify.

## Coding Style & Naming Conventions

- Codebase is primarily CommonJS JavaScript; follow the local file’s conventions (tabs/spaces, `var`/`let`, semicolons).
- Avoid drive-by reformatting; keep diffs focused on behavior.
- Prefer descriptive names; for bug regressions, mirror existing patterns like `test/bug/<issue>.js`.

## Testing Guidelines

- Tests use Mocha. Add coverage where behavior changes: unit tests in `test/`, regressions in `test/bug/`.
- Run targeted tests during development: `npx mocha test/bug/1243.js`.
- If you change `.d.ts` files, verify: `npx tsc -p tsconfig.json`.

## Commit & Pull Request Guidelines

- Commits are typically short, imperative subjects; common prefixes include `fix:` and `docs:` and many PRs include `(#NNNN)`.
- PRs should include: clear description, linked issue (if any), how to reproduce/verify, and what tests you ran.
- If you modify bundles (`gun.js`, `sea.js`), include updated artifacts (`gun.min.js`, relevant `.d.ts`) unless the change is docs-only.

## Security & Release Notes

- Follow `SECURITY.md` for responsible disclosure.
- Release automation is tag-driven (`v*`); see `RELEASE.md` for details.
