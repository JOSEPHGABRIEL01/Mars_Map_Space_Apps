/**
 * DEMO DATA — celestial bodies available in Worlds Map.
 * Content is fictional/illustrative until the backend is connected.
 */

export const CELESTIAL_BODIES = [
  {
    id: 'moon',
    name: 'Moon',
    tagline: 'Earth’s natural satellite',
    description:
      'The Moon is the closest celestial body to Earth and the main target for the next generation of human settlements. Its polar craters, basaltic plains and impact basins offer a wide range of terrains to compare with Earth.',
    facts: [
      { label: 'Mean distance from Earth', value: '384,400 km' },
      { label: 'Mean radius', value: '1,737 km' },
      { label: 'Surface gravity', value: '1.62 m/s²' },
      { label: 'Day length', value: '29.5 Earth days' },
      { label: 'Atmosphere', value: 'Negligible' },
    ],
    meanRadiusKm: 1737.4,
    image: '/images/bodies/moon.svg',
    accentColor: '#9fb0d0',
  },
  {
    id: 'mars',
    name: 'Mars',
    tagline: 'The Red Planet',
    description:
      'Mars is the most Earth-like planet in the Solar System and the long-term goal of human exploration. Its dry valleys, impact craters and giant volcanoes have well-known terrestrial analogs that help scientists test rovers and plan missions.',
    facts: [
      { label: 'Mean distance from the Sun', value: '227.9 million km' },
      { label: 'Mean radius', value: '3,390 km' },
      { label: 'Surface gravity', value: '3.72 m/s²' },
      { label: 'Day length', value: '24.6 Earth hours' },
      { label: 'Atmosphere', value: 'Thin (95% CO₂)' },
    ],
    meanRadiusKm: 3389.5,
    image: '/images/bodies/mars.svg',
    accentColor: '#e0714a',
  },
]
