// Generate social-share (Open Graph / Twitter card) images for every class.
//
// Social platforms (LinkedIn, iMessage, some chat unfurlers) don't reliably
// render .webp OG images, and cards want a 1200x630 (1.91:1) frame. This reads
// each class's `heroImage` from the registry and writes a cropped, centered
// JPEG to public/og-<slug>.jpg. The class page's generateMetadata points at it.
//
// Run after adding a class or changing a hero:  node scripts/generate-og-images.mjs

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const registry = readFileSync(join(root, "content/classes.ts"), "utf8");

// The registry is plain TS with one `slug: "..."` and one `heroImage: "..."`
// per class, in order — zip them into (slug, heroImage) pairs.
const slugs = [...registry.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const heroes = [...registry.matchAll(/heroImage:\s*"([^"]+)"/g)].map((m) => m[1]);

if (slugs.length !== heroes.length) {
  console.error(
    `Mismatch: ${slugs.length} slugs vs ${heroes.length} heroImages — check content/classes.ts`
  );
  process.exit(1);
}

const W = 1200;
const H = 630;
let made = 0;

for (let i = 0; i < slugs.length; i++) {
  const slug = slugs[i];
  const heroPath = join(root, "public", heroes[i].replace(/^\//, ""));
  const outPath = join(root, "public", `og-${slug}.jpg`);

  if (!existsSync(heroPath)) {
    console.warn(`⚠ ${slug}: hero ${heroes[i]} not found — skipping`);
    continue;
  }

  await sharp(heroPath)
    .resize(W, H, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
  console.log(`✓ og-${slug}.jpg  (from ${heroes[i]})`);
  made++;
}

console.log(`\nDone — ${made} OG image(s) written to public/.`);
