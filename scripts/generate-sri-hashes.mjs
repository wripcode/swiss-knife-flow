#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";

const LIBRARIES_DIR = resolve(
  import.meta.dirname,
  "../lib/attributes/libraries"
);

function computeSRI(buffer) {
  const hash = createHash("sha384").update(buffer).digest("base64");
  return `sha384-${hash}`;
}

async function fetchAndHash(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return computeSRI(buffer);
}

async function processLibrary(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const lib = JSON.parse(raw);
  let updated = false;
  const updates = [];

  if (lib.script?.hostedLocation && !lib.script.integrityHash) {
    const hash = await fetchAndHash(lib.script.hostedLocation);
    lib.script.integrityHash = hash;
    updated = true;
    updates.push(`  ✓ script → ${lib.script.displayName}`);
  }

  for (const cat of lib.categories ?? []) {
    if (!cat.cdn?.hostedLocation) continue;
    if (cat.cdn.integrityHash) continue;

    const hash = await fetchAndHash(cat.cdn.hostedLocation);
    cat.cdn.integrityHash = hash;
    updated = true;
    updates.push(`  ✓ cdn   → ${cat.cdn.displayName} (${cat.id})`);
  }

  if (updated) {
    writeFileSync(filePath, JSON.stringify(lib, null, 2) + "\n");
  }

  return updates;
}

async function main() {
  const files = readdirSync(LIBRARIES_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("No library files found.");
    return;
  }

  console.log(`\n🔒 SRI Hash Generator\n`);
  console.log(`Scanning ${files.length} library file(s)...\n`);

  let totalUpdated = 0;

  for (const file of files) {
    const filePath = join(LIBRARIES_DIR, file);
    console.log(`📦 ${file}`);

    try {
      const updates = await processLibrary(filePath);
      if (updates.length > 0) {
        updates.forEach((u) => console.log(u));
        totalUpdated += updates.length;
      } else {
        console.log("  — All hashes present");
      }
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
    console.log();
  }

  if (totalUpdated > 0) {
    console.log(`✅ Generated ${totalUpdated} SRI hash(es)\n`);
  } else {
    console.log(`✅ All SRI hashes already present\n`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
