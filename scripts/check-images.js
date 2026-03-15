#!/usr/bin/env node
/**
 * Checks all location image URLs in locations.json for broken/expired links.
 * Uses HEAD requests with a concurrency limit to avoid hammering servers.
 *
 * Usage: node scripts/check-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const DATA_PATH = path.join(__dirname, '../data/locations.json');
const CONCURRENCY = 20;
const TIMEOUT_MS = 10000;

function headRequest(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(
      { method: 'HEAD', hostname: parsed.hostname, path: parsed.pathname + parsed.search, port: parsed.port || undefined },
      (res) => resolve({ url, status: res.statusCode })
    );
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT' });
    });
    req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
    req.end();
  });
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  const queue = [...tasks];
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      results.push(await task());
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const entries = [];
  for (const video of data.videos) {
    for (const loc of video.locations) {
      if (loc.image && loc.image.startsWith('http')) {
        entries.push({ id: loc.id, name: loc.name, imageUrl: loc.image });
      }
    }
  }

  console.log(`Checking ${entries.length} image URLs (concurrency: ${CONCURRENCY})...\n`);

  let checked = 0;
  const tasks = entries.map((entry) => async () => {
    const result = await headRequest(entry.imageUrl);
    checked++;
    if (checked % 50 === 0) process.stdout.write(`  ${checked}/${entries.length}\n`);
    return { ...entry, ...result };
  });

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const broken = results.filter((r) => {
    const s = r.status;
    return s === 'TIMEOUT' || s === 'ERROR' || (typeof s === 'number' && (s === 404 || s === 410 || s >= 500));
  });
  const redirected = results.filter((r) => typeof r.status === 'number' && r.status >= 300 && r.status < 400);
  const ok = results.filter((r) => typeof r.status === 'number' && r.status >= 200 && r.status < 300);

  console.log(`\n=== Results ===`);
  console.log(`OK:         ${ok.length}`);
  console.log(`Redirected: ${redirected.length}`);
  console.log(`Broken:     ${broken.length}`);

  if (redirected.length > 0) {
    console.log('\n--- Redirected (may still work in browser) ---');
    for (const r of redirected) {
      console.log(`  [${r.status}] ${r.name} (${r.id})\n       ${r.imageUrl}`);
    }
  }

  if (broken.length > 0) {
    console.log('\n--- Broken ---');
    for (const r of broken) {
      const label = r.error ? `ERROR: ${r.error}` : r.status;
      console.log(`  [${label}] ${r.name} (${r.id})\n       ${r.imageUrl}`);
    }
    process.exit(1);
  } else {
    console.log('\nAll images OK.');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
