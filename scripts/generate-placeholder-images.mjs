/**
 * Generates the provisional SVG placeholders used while the final Figma
 * assets are not ready:
 *
 *   - public/images/earth-map.svg              equirectangular graticule
 *   - public/images/bodies/<body>.svg          Moon / Mars cards
 *   - public/images/locations/<location>.svg   location photos
 *
 * Run with: npm run assets:placeholders
 * The script overwrites the placeholders; do not run it after adding real art.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { CELESTIAL_BODIES, EARTH_LOCATIONS } from '../src/data/index.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC_DIR = path.join(ROOT, 'public')

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

function write(filePath, content) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf8')
  console.log(`created ${path.relative(ROOT, filePath)}`)
}

function buildEarthMapSvg() {
  const width = 1440
  const height = 720
  const step = 60 // 15 degrees
  const lines = []

  for (let x = 0; x <= width; x += step) {
    const isPrime = x === width / 2
    lines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${isPrime ? '#2f6bff' : '#16213f'}" stroke-opacity="${isPrime ? '0.8' : '1'}" />`,
    )
  }
  for (let y = 0; y <= height; y += step) {
    const isEquator = y === height / 2
    lines.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${isEquator ? '#2f6bff' : '#16213f'}" stroke-opacity="${isEquator ? '0.8' : '1'}" />`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Demo Earth map placeholder">
  <defs>
    <linearGradient id="ocean" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#061027" />
      <stop offset="0.5" stop-color="#081a3a" />
      <stop offset="1" stop-color="#061027" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ocean)" />
  <g stroke-width="1">${lines.join('')}</g>
  <g fill="#9fb0d0" font-family="Inter, sans-serif" font-size="16" opacity="0.7">
    <text x="12" y="24">90° N</text>
    <text x="${width - 60}" y="24">180° E</text>
    <text x="12" y="${height - 16}">90° S</text>
    <text x="${width - 60}" y="${height - 16}">180° W</text>
    <text x="${width / 2 - 22}" y="24">0°</text>
    <text x="${width / 2 - 22}" y="${height - 16}">0°</text>
  </g>
  <g fill="#35e0f2" font-family="Space Grotesk, sans-serif" text-anchor="middle" opacity="0.55">
    <text x="${width / 2}" y="${height / 2 - 10}" font-size="34">DEMO EARTH MAP</text>
    <text x="${width / 2}" y="${height / 2 + 26}" font-size="18">Equirectangular placeholder · replace with the final Figma asset</text>
  </g>
</svg>
`
}

function buildBodySvg(body, index) {
  const palette = index === 0
    ? { core: '#c9d3e3', mid: '#7d8aa3', edge: '#2a3448', glow: '#9fb0d0' }
    : { core: '#e08a63', mid: '#b4552f', edge: '#3a1a10', glow: '#e0714a' }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img" aria-label="${escapeXml(body.name)} placeholder">
  <defs>
    <radialGradient id="sphere" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="${palette.core}" />
      <stop offset="0.55" stop-color="${palette.mid}" />
      <stop offset="1" stop-color="${palette.edge}" />
    </radialGradient>
    <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.6" stop-color="${palette.glow}" stop-opacity="0.35" />
      <stop offset="1" stop-color="${palette.glow}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="200" cy="200" r="190" fill="url(#halo)" />
  <circle cx="200" cy="200" r="130" fill="url(#sphere)" />
  <g fill="#000" opacity="0.18">
    <circle cx="165" cy="170" r="18" />
    <circle cx="235" cy="215" r="26" />
    <circle cx="210" cy="145" r="10" />
    <circle cx="150" cy="235" r="12" />
  </g>
  <text x="200" y="368" fill="#9fb0d0" font-family="Inter, sans-serif" font-size="14" text-anchor="middle">DEMO</text>
</svg>
`
}

function buildLocationSvg(location) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Demo image for ${escapeXml(location.name)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1533" />
      <stop offset="1" stop-color="#101d42" />
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" />
  <g fill="none" stroke="#2f6bff" stroke-opacity="0.35">
    <circle cx="400" cy="230" r="190" />
    <circle cx="400" cy="230" r="150" />
    <circle cx="400" cy="230" r="110" />
    <path d="M0 230 H800 M400 0 V500" />
  </g>
  <g stroke="#35e0f2" stroke-opacity="0.5" stroke-width="2">
    <path d="M120 380 L240 300 L330 340 L470 250 L590 300 L700 230" fill="none" />
  </g>
  <text x="60" y="80" fill="#35e0f2" font-family="Space Grotesk, sans-serif" font-size="18" letter-spacing="6">DEMO IMAGE</text>
  <text x="60" y="140" fill="#e8f0ff" font-family="Space Grotesk, sans-serif" font-size="40">${escapeXml(location.name)}</text>
  <text x="60" y="180" fill="#9fb0d0" font-family="Inter, sans-serif" font-size="20">${escapeXml(location.country)}</text>
  <text x="60" y="440" fill="#9fb0d0" font-family="Inter, sans-serif" font-size="16" opacity="0.8">Placeholder — replace with a real photo.</text>
</svg>
`
}

write(path.join(PUBLIC_DIR, 'images', 'earth-map.svg'), buildEarthMapSvg())

CELESTIAL_BODIES.forEach((body, index) => {
  write(path.join(PUBLIC_DIR, body.image), buildBodySvg(body, index))
})

for (const location of EARTH_LOCATIONS) {
  write(path.join(PUBLIC_DIR, location.image), buildLocationSvg(location))
}

console.log('')
console.log('Placeholder assets generated.')
