# Repository Guidelines

## Project Structure & Module Organization

This repository contains a dependency-free browser game built with HTML, CSS, JavaScript, and the Canvas API. Keep the current layout unless a larger toolchain is intentionally introduced:

- `index.html` is the browser entry point and contains the game shell, HUD, and overlays.
- `src/game.js` owns gameplay state, enemy and weapon behavior, Canvas rendering, input handling, persistence, and synthesized audio.
- `src/styles.css` owns the responsive arcade layout, HUD styling, and visual effects.
- Add deterministic automated tests under `tests/`, mirroring the production module names, when gameplay logic is extracted into testable modules.
- Put future sprites, sounds, fonts, and other runtime media in `assets/` using descriptive, kebab-case filenames.
- Treat `.playwright-cli/`, `output/`, and OS metadata such as `.DS_Store` as local or generated artifacts, not production source.

## Build, Test, and Development Commands

No dependency installation or build step is required. Open `index.html` directly in a modern browser to run the game. Use the following check before submitting JavaScript changes:

- `node --check src/game.js` validates JavaScript syntax without modifying files.

After gameplay or styling changes, verify the game manually in a browser at desktop and mobile viewport sizes. If a package-based toolchain is added later, expose canonical development, build, lint, and test commands through `package.json` scripts and document them in `README.md`.

## Coding Style & Naming Conventions

Use two spaces for HTML, CSS, JavaScript, JSON, and configuration files unless a future formatter specifies otherwise. Prefer `camelCase` for variables/functions, `PascalCase` for classes/components, kebab-case CSS classes, and `kebab-case` for assets. Preserve the current dependency-free approach for small changes. Keep gameplay behavior explicit and extract focused modules when `src/game.js` becomes difficult to navigate. Add a formatter and linter if a package toolchain is selected, then run them before submitting.

## Testing Guidelines

There is currently no automated test suite. For every change, run the syntax check and manually verify starting, movement, automatic firing, special ammunition, pause/resume, game over/restart, and responsive controls when relevant. Future tests should be deterministic and fast, with unit coverage for movement, spawning, scoring, collision rules, pickups, and weapon behavior. Name files after the module under test (for example, `tests/physics.test.js`) and add browser coverage for critical workflows.

## Commit & Pull Request Guidelines

No repository Git history is available in this scaffold, so no existing commit convention can be inferred. Use concise imperative subjects, optionally prefixed by scope (for example, `physics: clamp player velocity`). Pull requests should explain the behavior change, include verification results, link the issue, and attach screenshots or a short recording for visible gameplay changes. Keep PRs focused and call out follow-up work.

## Security & Configuration

Never commit secrets, credentials, or generated build output. Keep local-only values in an ignored `.env` file and provide a `.env.example` documenting required variables. Review new third-party assets and dependencies for license and provenance before adding them.
