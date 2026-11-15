/**
 * Generates the provisional SVG placeholders used while the final assets are
 * not ready:
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
    <text x="${width / 2}" y="${height / 2 + 26}" font-size="18">Equirectangular placeholder · replace with the final asset</text>
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

function hashString(value) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed) {
  let state = seed || 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pickPalette(location) {
  const text = `${location.environment?.join(' ') ?? ''} ${location.summary ?? ''}`.toLowerCase()

  if (/(polar|ice|glacier|permafrost|snow|antarctic)/.test(text)) {
    return {
      skyTop: '#071226',
      skyBottom: '#2b5a82',
      sun: '#d8f2ff',
      ridgeBack: '#3d6b8c',
      ridgeFront: '#183349',
      ground: '#0a1929',
    }
  }

  if (/(volcan|basalt|lava|geothermal|sulfate)/.test(text)) {
    return {
      skyTop: '#130a16',
      skyBottom: '#5c2a24',
      sun: '#ffb17a',
      ridgeBack: '#41232c',
      ridgeFront: '#1e0f14',
      ground: '#0c0609',
    }
  }

  if (/(arid|desert|dry|salt|evaporite|dune)/.test(text)) {
    return {
      skyTop: '#0c1526',
      skyBottom: '#6b412c',
      sun: '#f7c15c',
      ridgeBack: '#5a4035',
      ridgeFront: '#2c211f',
      ground: '#171011',
    }
  }

  return {
    skyTop: '#061322',
    skyBottom: '#1f5060',
    sun: '#e8f0ff',
    ridgeBack: '#2f5a66',
    ridgeFront: '#123039',
    ground: '#071a20',
  }
}

function buildRidge(random, baseline, amplitude, steps) {
  const width = 800
  const points = []

  for (let index = 0; index <= steps; index += 1) {
    const x = (width / steps) * index
    const wave = Math.sin(index * 1.35 + random() * 0.8) * amplitude
    const jitter = (random() - 0.5) * amplitude * 0.9
    points.push([x, baseline + wave + jitter])
  }

  const path = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')

  return `${path} L${width} 500 L0 500 Z`
}

function buildLocationSvg(location) {
  const random = createRandom(hashString(location.id))
  const palette = pickPalette(location)
  const backRidge = buildRidge(random, 300, 46, 9)
  const frontRidge = buildRidge(random, 372, 34, 7)
  const sunX = 560 + random() * 120
  const sunY = 120 + random() * 50

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Demo landscape for ${escapeXml(location.name)}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.skyTop}" />
      <stop offset="1" stop-color="${palette.skyBottom}" />
    </linearGradient>
    <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${palette.sun}" stop-opacity="0.85" />
      <stop offset="0.35" stop-color="${palette.sun}" stop-opacity="0.22" />
      <stop offset="1" stop-color="${palette.sun}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.ridgeFront}" />
      <stop offset="1" stop-color="${palette.ground}" />
    </linearGradient>
  </defs>

  <rect width="800" height="500" fill="url(#sky)" />
  <circle cx="${sunX}" cy="${sunY}" r="150" fill="url(#sunGlow)" />
  <circle cx="${sunX}" cy="${sunY}" r="34" fill="${palette.sun}" opacity="0.9" />

  <g fill="#ffffff" opacity="0.5">
    <circle cx="90" cy="70" r="1.6" />
    <circle cx="180" cy="120" r="1.2" />
    <circle cx="280" cy="52" r="1.4" />
    <circle cx="380" cy="90" r="1" />
    <circle cx="470" cy="44" r="1.5" />
    <circle cx="690" cy="70" r="1.2" />
    <circle cx="740" cy="130" r="1" />
  </g>

  <path d="${backRidge}" fill="${palette.ridgeBack}" opacity="0.65" />
  <path d="${frontRidge}" fill="url(#ground)" />
  <rect y="392" width="800" height="108" fill="${palette.ground}" opacity="0.7" />

  <g font-family="Space Grotesk, Inter, sans-serif">
    <rect x="36" y="34" width="86" height="26" rx="13" fill="#060b18" opacity="0.55" />
    <text x="79" y="52" fill="${palette.sun}" font-size="12" letter-spacing="3" text-anchor="middle">DEMO</text>
    <text x="40" y="448" fill="#f0f5ff" font-size="30" font-weight="600">${escapeXml(location.name)}</text>
    <text x="40" y="476" fill="#9baec9" font-size="16" letter-spacing="1">${escapeXml(location.country)}</text>
  </g>
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
