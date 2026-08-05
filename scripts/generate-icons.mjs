// Generates placeholder PWA/favicon icons from an inline SVG mark.
// Replace public/icons/mark.svg with the real logo when the client provides one (see IMPLEMENTATION_PLAN.md Appendix C).
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');
mkdirSync(iconsDir, { recursive: true });

const AMBER = '#f0b21d';
const CHARCOAL = '#2b2a28';

// Simple paw-print mark, flat-fill, high contrast — safe at small sizes.
const markSvg = (bg) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${bg}"/>
  <g fill="${CHARCOAL}">
    <ellipse cx="256" cy="320" rx="108" ry="92"/>
    <ellipse cx="146" cy="200" rx="46" ry="58"/>
    <ellipse cx="256" cy="150" rx="50" ry="62"/>
    <ellipse cx="366" cy="200" rx="46" ry="58"/>
    <ellipse cx="190" cy="140" rx="0" ry="0"/>
  </g>
</svg>`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${AMBER}"/>
  <g fill="${CHARCOAL}" transform="translate(256 256) scale(0.62) translate(-256 -256)">
    <ellipse cx="256" cy="320" rx="108" ry="92"/>
    <ellipse cx="146" cy="200" rx="46" ry="58"/>
    <ellipse cx="256" cy="150" rx="50" ry="62"/>
    <ellipse cx="366" cy="200" rx="46" ry="58"/>
  </g>
</svg>`;

writeFileSync(path.join(iconsDir, 'mark.svg'), markSvg(AMBER));

const jobs = [
  { file: '192.png', size: 192, svg: markSvg(AMBER) },
  { file: '512.png', size: 512, svg: markSvg(AMBER) },
  { file: 'maskable-512.png', size: 512, svg: maskableSvg },
  { file: 'apple-touch-icon.png', size: 180, svg: markSvg(AMBER) },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg)).resize(job.size, job.size).png().toFile(path.join(iconsDir, job.file));
  console.log(`generated icons/${job.file}`);
}

// Favicon (SVG, scales natively).
writeFileSync(path.join(publicDir, 'favicon.svg'), markSvg(AMBER));
console.log('generated favicon.svg');
