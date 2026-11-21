// Leonida Trophy Checklist — make.fun gta6-trophy-guide-01 entry (Node 22, stdlib only).
//
// This program hands in the guide that lives in app/: plain static files a browser
// opens at app/index.html (an ES module plus CSS, no build step), fully offline. The
// trophy list and the per-trophy guides live in app/data/trophies.json — all 55
// official PS5 trophies, each with its official name, description and grade, a guide
// in our own words, a short tip, and cited sources. The program copies app/ and
// screenshots/ from beside this file into /output and writes /output/dossier.json,
// the summary the judge reads (screenshots, the files and bytes of the first load,
// and the source), using the vendored make.fun library. Leave
// vendor/makefun-frontend.ts alone: the scorer requires dossier.json to be byte for
// byte what its own copy writes.
//
// Try it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const KIND_LIST = ['story', 'chapter', 'mission', 'side-character', 'activity', 'collectible', 'robbery', 'combat', 'exploration', 'misc'];
const SPLIT_WANTED = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const HIDDEN_WANTED = 28;

function abort(message) {
  throw new Error(message);
}

// The scorer's trophies row: app/data/trophies.json has to name every one of the
// official 55 trophies (name match under the gate's nameKey) with a non-blank guide
// and a non-blank tip. Refuse to hand in a guide that would fail that row rather
// than ship a broken dossier.
function readTrophyEntries() {
  const text = readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8');
  const doc = JSON.parse(text);
  const entries = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(entries)) abort('trophies.json does not hold a trophy list');
  if (entries.length !== 55) abort(`trophies.json must hold 55 trophies, found ${entries.length}`);
  const names = new Set();
  const tally = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let hiddenCount = 0;
  let missableCount = 0;
  for (const entry of entries) {
    if (typeof entry.name !== 'string' || entry.name.trim() === '') abort('trophy without a name');
    if (names.has(entry.name)) abort(`duplicate trophy name: ${entry.name}`);
    names.add(entry.name);
    if (!GRADE_ORDER.includes(entry.grade)) abort(`${entry.name}: bad grade ${entry.grade}`);
    if (typeof entry.description !== 'string' || entry.description.trim() === '') abort(`${entry.name}: blank description`);
    if (typeof entry.guide !== 'string' || entry.guide.trim() === '') abort(`${entry.name}: blank guide`);
    if (typeof entry.tip !== 'string' || entry.tip.trim() === '') abort(`${entry.name}: blank tip`);
    if (typeof entry.hidden !== 'boolean') abort(`${entry.name}: hidden flag must be a boolean`);
    if (typeof entry.missable !== 'boolean') abort(`${entry.name}: missable flag must be a boolean`);
    if (!KIND_LIST.includes(entry.kind)) abort(`${entry.name}: bad kind ${entry.kind}`);
    if (!Array.isArray(entry.sources) || entry.sources.length === 0) abort(`${entry.name}: no sources cited`);
    tally[entry.grade]++;
    if (entry.hidden) hiddenCount++;
    if (entry.missable) missableCount++;
  }
  for (const grade of GRADE_ORDER) {
    if (tally[grade] !== SPLIT_WANTED[grade]) {
      abort(`grade split must be 1/2/6/46, found ${tally.platinum}/${tally.gold}/${tally.silver}/${tally.bronze}`);
    }
  }
  if (hiddenCount !== HIDDEN_WANTED) abort(`28 trophies must be flagged hidden, found ${hiddenCount}`);
  return { entries, tally, hiddenCount, missableCount };
}

const verified = readTrophyEntries();
console.log(
  `trophies: ${verified.entries.length} (${verified.tally.platinum} platinum, ${verified.tally.gold} gold, ` +
  `${verified.tally.silver} silver, ${verified.tally.bronze} bronze; ` +
  `${verified.hiddenCount} hidden; ${verified.missableCount} missable)`,
);

// The scorer refuses more than 4 screenshots, any one over 256 KiB, or a long side
// over 1280 px / short side under 480 px. Check the files before handing them in;
// the pixel size is checked by the shot script that produces them (see shots.json).
function verifyShots() {
  const dir = join(repoRoot, 'screenshots');
  if (!existsSync(dir)) abort('screenshots/ missing: need 3 or 4 shots');
  const files = readdirSync(dir).filter((name) => /\.(png|jpe?g)$/i.test(name)).sort();
  if (files.length < 3 || files.length > 4) abort(`need 3 or 4 screenshots, found ${files.length}`);
  for (const name of files) {
    const size = statSync(join(dir, name)).size;
    if (size > 262144) abort(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  }
  return files;
}

const shotFiles = verifyShots();
console.log(`screenshots: ${shotFiles.join(', ')}`);

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierLimits));
console.log(`dossier written to ${join(outputDir, 'dossier.json')}`);
