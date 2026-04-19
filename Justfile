# Default: show available recipes
default:
    @just --list

# Start the Astro dev server
dev:
    npm run dev

# Build the Astro production site
build:
    npm run build

# Preview the production build locally
preview:
    npm run preview

# Start Storybook on port 6009
storybook:
    npm run storybook

# Build Storybook to storybook-static/
build-storybook:
    npm run build-storybook

# Run Vitest once
test:
    npm test

# Run Vitest in watch mode
test-watch:
    npm run test:watch

# Screenshot Storybook stories. Optional SUBSTR filters by story id.
# Usage: just screenshot  |  just screenshot InteractiveFrame
screenshot SUBSTR="":
    #!/usr/bin/env bash
    if [ -z "{{SUBSTR}}" ]; then
        node scripts/screenshot.mjs
    else
        node scripts/screenshot.mjs --grep {{SUBSTR}}
    fi

# Run everything: tests + Astro build + Storybook build
check: test build build-storybook
