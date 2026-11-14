/**
 * DEMO DATA — regions of the Moon and Mars.
 * Coordinates are approximate and meant only to position labels in the UI.
 */

export const REGIONS = [
  // ---------------------------------------------------------------- Moon
  {
    id: 'moon-shackleton',
    bodyId: 'moon',
    name: 'Shackleton Crater',
    locationLabel: 'Lunar South Pole',
    type: 'Permanently shadowed polar crater',
    summary:
      'A deep crater near the lunar south pole where sunlight never reaches the interior. Its floor is one of the coldest places in the Solar System and a prime candidate for water-ice deposits.',
    highlights: ['Permanent shadow', 'Water-ice potential', 'Extreme cold'],
    coordinates: { lat: -89.9, lng: 0 },
  },
  {
    id: 'moon-mare-serenitatis',
    bodyId: 'moon',
    name: 'Mare Serenitatis',
    locationLabel: 'North-eastern near side',
    type: 'Basaltic mare plain',
    summary:
      'A large, dark plain formed by ancient flood basalts. Its flat surface and low relief make it a useful reference for volcanic plains on Earth.',
    highlights: ['Flood basalt', 'Flat terrain', 'Low albedo'],
    coordinates: { lat: 28.0, lng: 17.5 },
  },
  {
    id: 'moon-mare-imbrium',
    bodyId: 'moon',
    name: 'Mare Imbrium',
    locationLabel: 'North-western near side',
    type: 'Impact basin filled with basalt',
    summary:
      'One of the largest impact basins on the Moon, later flooded by basaltic lava. Its ring structures and lava plains resemble large terrestrial volcanic provinces.',
    highlights: ['Impact basin', 'Lava plains', 'Ring structures'],
    coordinates: { lat: 32.8, lng: -15.6 },
  },
  {
    id: 'moon-taurus-littrow',
    bodyId: 'moon',
    name: 'Taurus–Littrow Valley',
    locationLabel: 'Apollo 17 landing site',
    type: 'Valley with regolith and boulders',
    summary:
      'A narrow valley at the edge of Mare Serenitatis, visited by Apollo 17. It combines dark basaltic soil, landslide deposits and large boulders.',
    highlights: ['Regolith', 'Landslide deposits', 'Boulder fields'],
    coordinates: { lat: 20.19, lng: 30.77 },
  },
  {
    id: 'moon-copernicus',
    bodyId: 'moon',
    name: 'Copernicus Crater',
    locationLabel: 'Oceanus Procellarum',
    type: 'Complex impact crater',
    summary:
      'A well-preserved complex crater with terraced walls, a central peak and an extensive ejecta blanket, useful to study impact processes.',
    highlights: ['Central peak', 'Terraced walls', 'Ejecta blanket'],
    coordinates: { lat: 9.62, lng: -20.08 },
  },
  {
    id: 'moon-south-pole-aitken',
    bodyId: 'moon',
    name: 'South Pole–Aitken Basin',
    locationLabel: 'Lunar far side',
    type: 'Deep ancient impact basin',
    summary:
      'The largest and one of the oldest impact basins on the Moon. Its deep crustal exposures provide a window into the lunar interior.',
    highlights: ['Ancient crust', 'Deep basin', 'Far side'],
    coordinates: { lat: -53.0, lng: -169.0 },
  },

  // ---------------------------------------------------------------- Mars
  {
    id: 'mars-jezero',
    bodyId: 'mars',
    name: 'Jezero Crater',
    locationLabel: 'Northeast Syrtis Major',
    type: 'Ancient lake and river delta',
    summary:
      'A crater that once held a lake, with a preserved river delta and clay-rich sediments. It is the landing site of NASA’s Perseverance rover.',
    highlights: ['Paleolake', 'River delta', 'Clay minerals'],
    coordinates: { lat: 18.38, lng: 77.58 },
  },
  {
    id: 'mars-gale',
    bodyId: 'mars',
    name: 'Gale Crater',
    locationLabel: 'Aeolis Palus',
    type: 'Crater with a sedimentary mound',
    summary:
      'A large crater containing Aeolis Mons (Mount Sharp), a stack of layered sediments that records the planet’s wet history. Landing site of the Curiosity rover.',
    highlights: ['Layered sediments', 'Mount Sharp', 'Ancient water'],
    coordinates: { lat: -5.4, lng: 137.8 },
  },
  {
    id: 'mars-valles-marineris',
    bodyId: 'mars',
    name: 'Valles Marineris',
    locationLabel: 'Equatorial canyon system',
    type: 'Giant canyon system',
    summary:
      'A canyon system more than 4,000 km long and up to 7 km deep, with walls that expose billions of years of Martian geology.',
    highlights: ['Canyon walls', 'Stratigraphy', 'Landslides'],
    coordinates: { lat: -14.0, lng: -59.2 },
  },
  {
    id: 'mars-olympus-mons',
    bodyId: 'mars',
    name: 'Olympus Mons',
    locationLabel: 'Tharsis volcanic province',
    type: 'Shield volcano',
    summary:
      'The tallest volcano in the Solar System, about 22 km high, with a summit caldera and vast lava flows.',
    highlights: ['Shield volcano', 'Caldera', 'Lava flows'],
    coordinates: { lat: 18.65, lng: -133.8 },
  },
  {
    id: 'mars-utopia-planitia',
    bodyId: 'mars',
    name: 'Utopia Planitia',
    locationLabel: 'Northern lowlands',
    type: 'Sedimentary lowland plain',
    summary:
      'A vast northern plain where NASA’s Viking 2 landed. It may once have hosted a large ocean and shows polygonal ground related to subsurface ice.',
    highlights: ['Polygonal terrain', 'Subsurface ice', 'Ancient ocean'],
    coordinates: { lat: 46.7, lng: 117.5 },
  },
  {
    id: 'mars-argyre-planitia',
    bodyId: 'mars',
    name: 'Argyre Planitia',
    locationLabel: 'Southern highlands',
    type: 'Impact basin',
    summary:
      'A large impact basin surrounded by mountainous rings, with glacial and fluvial features that suggest past water activity.',
    highlights: ['Impact basin', 'Glacial features', 'Mountain rings'],
    coordinates: { lat: -49.7, lng: -43.0 },
  },
]
