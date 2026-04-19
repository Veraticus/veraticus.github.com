#!/usr/bin/env node

/**
 * Screenshot utility for capturing Storybook stories.
 *
 * Usage:
 *   node scripts/screenshot.mjs                                  # all stories
 *   node scripts/screenshot.mjs --grep InteractiveFrame          # filter by id substring
 *   node scripts/screenshot.mjs --id primitives-interactiveframe--default
 *   node scripts/screenshot.mjs --port 6009                      # custom port
 *   node scripts/screenshot.mjs --width 1440                     # custom viewport width
 *
 * Output: screenshots/<story-id>.png
 *
 * Requires: Storybook dev server running (npm run storybook), and chromium available.
 * On NixOS, the system chromium is used; npx playwright's bundled Chromium cannot run.
 */

import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  for (const cmd of ['chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome']) {
    try {
      const path = execFileSync('which', [cmd], { encoding: 'utf-8' }).trim();
      if (path) return path;
    } catch {
      // not found
    }
  }

  return undefined;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let port = 6009;
  let width = 1280;
  let height = 800;
  let grep = null;
  let id = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--port') port = Number(args[++i]);
    else if (arg === '--width') { width = Number(args[++i]); height = Math.round(width * 800 / 1280); }
    else if (arg === '--grep') grep = args[++i];
    else if (arg === '--id') id = args[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/screenshot.mjs [--grep <substr>] [--id <story-id>] [--port 6009] [--width 1280]');
      process.exit(0);
    }
  }

  return { port, width, height, grep, id };
}

async function main() {
  const { port, width, height, grep, id } = parseArgs();
  const outDir = join(rootDir, 'screenshots');
  await mkdir(outDir, { recursive: true });

  const indexUrl = `http://localhost:${port}/index.json`;
  let index;
  try {
    const res = await fetch(indexUrl);
    if (!res.ok) throw new Error(`Storybook returned ${res.status} for ${indexUrl}`);
    index = await res.json();
  } catch (err) {
    console.error(`Cannot reach Storybook at ${indexUrl}. Is \`npm run storybook\` running?`);
    console.error(err.message);
    process.exit(1);
  }

  const allStories = Object.values(index.entries).filter((e) => e.type === 'story');
  let stories = allStories;
  if (id) stories = allStories.filter((s) => s.id === id);
  else if (grep) stories = allStories.filter((s) => s.id.includes(grep.toLowerCase()) || s.title.toLowerCase().includes(grep.toLowerCase()));

  if (stories.length === 0) {
    console.error(`No stories matched. Available ids:`);
    for (const s of allStories) console.error(`  ${s.id}`);
    process.exit(1);
  }

  const { chromium } = await import('playwright-core');
  const executablePath = findChromium();
  if (!executablePath) {
    console.error('No chromium binary found. Install chromium or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.');
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport: { width, height } });

  console.log(`Capturing ${stories.length} stor${stories.length === 1 ? 'y' : 'ies'} at ${width}x${height}`);
  for (const story of stories) {
    const url = `http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`;
    const outputPath = join(outDir, `${story.id}.png`);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: outputPath });
      console.log(`  ${story.id} → screenshots/${story.id}.png`);
    } catch (err) {
      console.error(`  ${story.id} FAILED: ${err.message}`);
    }
  }

  await browser.close();
}

main();
