# joshsymonds.com

Personal website built with Astro featuring Memphis design aesthetic.

## Screenshots (NixOS)

On NixOS, `npx playwright` fails because Playwright's bundled Chromium can't run. Use the system chromium directly:

```bash
# Take a screenshot
chromium --headless --disable-gpu --screenshot=/path/to/output.png --window-size=1920,1080 http://localhost:4321

# Crop to specific viewport
chromium --headless --disable-gpu --screenshot=/path/to/output.png --window-size=1440,900 http://localhost:4321
```

## Development

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

## Design System

Memphis design: bold flat colors, geometric shapes, hard black borders (3px), offset shadows (4px 4px 0 black).

Key colors:
- `--teal: #2ec4b6` - Primary accent
- `--coral: #ff6b6b` - Secondary accent
- `--yellow: #ffd166` - Tertiary accent
- `--black: #1a1a1a` - Borders, text
- `--bg: #fafaf7` - Background

## Memphis Logo

The "Josh Symonds" logo uses geometric shapes:
- First "O" (Josh) = teal circle
- Second "O" (Symonds) = coral circle
- "S" (Symonds) = yellow diagonal stripe behind

Note: Due to Astro's CSS scoping, the coral color for the second O uses inline styles in Header.astro.
