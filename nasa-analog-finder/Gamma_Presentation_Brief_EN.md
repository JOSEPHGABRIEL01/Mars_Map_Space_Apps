# Gamma Presentation Brief — NASA Analog Finder

## Instruction to Gamma

Create a polished, scientifically credible presentation in **English**, with a
maximum of **7 slides including the title slide**, for an audience of
informatics judges and NASA/space-science judges.

The presentation must explain the **methodology used to create NASA Analog
Finder**, how the data flows through the system, why the tool is useful, who it
serves, and why the customizable search interface is essential. The story
should be: **Earth is a testbed for exploring other worlds, and this tool
turns that idea into an explainable, interactive search workflow.**

Do not present the tool as an official NASA product, a perfect planetary twin
detector, or a replacement for expert validation. Call it a research prototype
that supports site screening, field-campaign planning, instrument testing,
robotics preparation, and education.

### Visual and editorial direction

- Use a dark scientific visual language: near-black navy background, white
  text, electric blue for Earth/data, warm orange-red for Mars, and pale gray
  for the Moon.
- Use restrained typography, high contrast, large numbers, short statements,
  and clear diagrams. Avoid generic “AI magic” imagery.
- Prefer a visual hierarchy of: **problem → method → evidence → impact**.
- Use maps, data-flow diagrams, parameter cards, and one simple scoring
  graphic. Do not overcrowd slides with code.
- Use the product name **NASA Analog Finder** and the interface name
  **Worlds Map**. Include a small disclaimer: “NASA Space Apps prototype —
  not an official NASA product.”
- Use only the verified facts in this brief. Do not invent benchmark scores,
  mission endorsements, field results, or machine-learning claims.
- If an application screenshot is not available, create a clearly labeled
  schematic mockup based on the described interface, not a fictional
  screenshot.
- Add concise speaker notes for each slide. The deck should be understandable
  without reading the notes.

## Verified project context

NASA Analog Finder is an interactive web application that searches Earth for
locations whose measured or curated environmental characteristics resemble a
selected reference site on the Moon or Mars.

The current generated datasets contain:

- **42 planetary reference targets** across the Moon and Mars.
- **2,029 generated Earth records** used by the current frontend data files.
- A curated CSV seed of **50 Earth candidate locations** is included in the
  repository; the current generated frontend file contains the larger
  processed Earth dataset used by the interface.

The current reference examples shown in the interface include:

- Moon: **South Pole** and **Marius Hills**.
- Mars: **Jezero Crater** and **Gale Crater**.

The application compares these environmental dimensions when both records have
valid values:

1. Maximum temperature
2. Minimum temperature
3. Thermal range (ΔT)
4. Terrain slope
5. Vegetation index (NDVI)
6. Dust/aerosol indicator (AOD)
7. Sulfate index

The interface reports a weighted similarity percentage and a parameter-level
breakdown. Missing measurements are excluded from the comparison rather than
silently treated as zero.

## Slide-by-slide specification

### Slide 1 — NASA Analog Finder: Find Other Worlds in Earth

**Purpose:** Establish the project and its central idea immediately.

**On-slide content:**

- Title: **NASA Analog Finder**
- Subtitle: **An explainable Earth-analog search for Moon and Mars exploration**
- One-line value proposition:  
  **“Compare planetary reference environments with Earth locations before
  testing technology or planning field campaigns.”**
- Small labels: **Worlds Map · NASA Space Apps prototype**
- Disclaimer: **Not an official NASA product**

**Visual direction:**

- Hero composition: Earth viewed from space transitioning into a Moon/Mars
  surface texture.
- Add a small product mockup or screenshot placeholder showing the interactive
  map and ranked Earth sites.
- Keep the slide minimal; do not put methodology on the title slide.

**Speaker note:**  
NASA Analog Finder operationalizes the Earth-analog concept: researchers start
with a planetary environment or a set of desired conditions, and the system
helps them locate comparable environments on Earth.

### Slide 2 — The Challenge: Space Environments Must Be Studied on Earth

**Purpose:** Explain the problem, users, and practical importance.

**On-slide content:**

- Planetary sites are remote, expensive, and impossible to reproduce fully on
  Earth.
- Researchers still need Earth locations to test instruments, rovers,
  sampling protocols, operations, and human procedures.
- A useful analog is **not a perfect copy**; it is a location that matches the
  characteristics relevant to a specific research question.
- Primary users:
  - Planetary scientists and astrobiologists
  - Robotics, rover, and mission-operations engineers
  - Field researchers and instrument teams
  - Educators and science communicators

**Visual direction:**

- Three-part visual: planetary target → Earth field site → mission preparation.
- Show the distinction between “same planet” and “same useful process.”
- Use a callout: **“The question is not ‘Which place looks like Mars?’ but
  ‘Which Earth conditions are useful for this mission question?’”**

**Speaker note:**  
The tool reduces the initial search space and makes the reasoning inspectable.
It does not replace geological judgment, local logistics, or mission-specific
validation.

### Slide 3 — Methodology: From Open Data to Comparable Profiles

**Purpose:** Show how the project was created and how heterogeneous data become
comparable.

**On-slide data-flow diagram:**

`Planetary reference data + Earth source data`
→ `Curated CSV tables`
→ `Python/Pandas processing pipeline`
→ `Generated JSON datasets`
→ `Worlds Map frontend`
→ `Interactive ranking and map`

**Data sources to name:**

- Moon reference data: NASA **LRO LOLA** topography and **LRO Diviner**
  thermal observations.
- Mars reference data: NASA **MGS MOLA**, **MRO/HiRISE**, **Curiosity REMS**,
  **Perseverance MEDA/Mastcam-Z**, and related mission observations in the
  curated target records.
- Earth data pipeline: Microsoft Planetary Computer **STAC API** with
  NASADEM 30 m, MODIS land-surface temperature, Landsat 8–9 OLI/TIRS
  reflectance, and MODIS aerosol-related data.
- Processing: Python and Pandas convert source tables and observations into
  normalized records for the browser.

**Important implementation details:**

- Default processing is deterministic and offline using curated fallback
  values.
- Optional live API mode attempts remote observations and falls back to the
  curated values when an observation is unavailable.
- Frontend JSON files are generated outputs, not hand-edited source data.

**Visual direction:**

- Use connected cards with one icon per layer: planetary missions, Earth
  satellites, Python pipeline, JSON, map interface.
- Show the verified dataset numbers: **42 planetary targets · 2,029 generated
  Earth records**.

**Speaker note:**  
The key methodological decision is to separate data acquisition from
comparison. That makes the system reproducible offline while leaving room for
new datasets and live observations.

### Slide 4 — How the Similarity Engine Works

**Purpose:** Make the ranking scientifically understandable rather than a
black box.

**On-slide content:**

- Each candidate Earth site is represented as a vector of environmental
  parameters.
- For each shared parameter, the system computes a normalized difference:
  larger differences produce lower similarity.
- Each parameter contributes with a documented weight.
- The final score is a weighted average of parameter-level Gaussian similarity
  scores:

  `similarity_i = 100 × exp(-(difference / scale_i)^2)`

  `final score = weighted average of all valid similarity_i`

- Current emphasis:
  - Thermal range and sulfate index: higher weights
  - Maximum and minimum temperature: higher weights
  - Slope and dust/aerosol: standard weights
  - NDVI: lower weight because vegetation is mainly a contextual Earth
    variable for planetary analog work

**Critical scientific behavior:**

- Only parameters present in **both** the target and candidate are compared.
- Missing data are excluded from the weighted average, never converted to zero.
- The result includes both a total score and a parameter-by-parameter
  explanation.

**Visual direction:**

- Use a simple two-column comparison card: “Mars reference” vs. “Earth site.”
- Show arrows from parameter differences to a final score.
- Include a small “Explainable result” badge, not an “AI score” badge.

**Speaker note:**  
This model is intentionally transparent. A researcher can see whether a site
ranked highly because of temperature, slope, dust, sulfates, or a combination
of factors.

### Slide 5 — The Interface: A Researcher Controls the Question

**Purpose:** Justify why the customizable interface is central to the project,
not merely a visual convenience.

**On-slide content:**

- Select a world: **Moon or Mars**.
- Select a mission target: for example, South Pole, Marius Hills, Jezero
  Crater, or Gale Crater.
- Open **“Custom target”** and enter only the environmental values relevant to
  the research question.
- Review a ranked list of Earth analogs on the map.
- Inspect the selected site’s score, parameter breakdown, coordinates,
  environment type, and source references.
- Adjust how many ranked candidates are visible.
- Use dark/light map presentation and open a location in OpenStreetMap for
  geographic context.

**Why customization is scientifically important:**

1. Different experiments need different analog definitions. A rover mobility
   study may prioritize slope and terrain; a thermal-survival study may
   prioritize maximum/minimum temperature and ΔT.
2. Researchers often know the conditions they need before they know the
   location. The interface lets them express that hypothesis directly.
3. Partial targets are valid. Blank fields are ignored, so incomplete
   measurements do not create false similarity.
4. It makes the workflow reusable: the same tool can support Moon studies,
   Mars studies, a published mission site, or a researcher’s own field
   specification.

**Visual direction:**

- Main visual: a three-step UI sequence:
  `Define conditions → Rank Earth sites → Inspect evidence`.
- Show a form with temperature, ΔT, slope, NDVI, dust/aerosol, and sulfate
  fields.
- Add a callout: **“The researcher defines what ‘analog’ means.”**

**Speaker note:**  
The interface is a scientific control surface. It prevents the system from
imposing one universal definition of similarity on every research team.

### Slide 6 — Why It Matters: From Ranking to Mission Readiness

**Purpose:** Demonstrate practical value, differentiation, and honest limits.

**On-slide content:**

**What the project enables**

- Faster first-pass screening of Earth field sites
- Evidence-based planning of field campaigns and instrument tests
- Rover and robotics operations testing in relevant terrain
- Cross-disciplinary communication between Earth and planetary science
- An accessible educational view of why Earth environments can be useful
  planetary analogs

**What differentiates it**

- Combines Moon/Mars reference records with Earth candidate records in one
  workflow.
- Makes the score inspectable at parameter level.
- Supports custom targets rather than only fixed preselected sites.
- Runs locally from generated JSON, preserving a usable offline/demo path.
- Keeps data provenance visible in the site dossier and target records.

**Scientific honesty / limits**

- Earth cannot reproduce lunar vacuum, Mars atmospheric pressure, radiation,
  gravity, or the full coupled planetary environment.
- A high score means “useful match for the selected variables,” not “perfect
  twin.”
- Results are a screening aid; expert geology, logistics, temporal sampling,
  and field validation remain necessary.

**Visual direction:**

- Use a split layout: “Decision support” on the left, “What it does not claim”
  on the right.
- Show a bridge from Earth field operations to lunar/Martian mission
  preparation, with a transparent boundary around the analogy.

**Speaker note:**  
The project stands out because it combines usability with scientific caution:
it surfaces useful analogies while making the breaks in those analogies
visible.

### Slide 7 — Closing: A Reproducible Starting Point for Earth-Analog Research

**Purpose:** End with a clear contribution and call to action.

**On-slide content:**

- **Contribution:** An interactive, explainable, data-connected workflow for
  finding Earth environments relevant to Moon and Mars research.
- **Current prototype:** 42 planetary reference targets and 2,029 generated
  Earth records, with an offline-capable web interface.
- **Next steps:**
  - Add more validated Earth and planetary datasets.
  - Add temporal analysis and additional terrain/mineral variables.
  - Add expert-reviewed analog case studies and field validation.
  - Preserve provenance, uncertainty, and analogy-break reporting as the
    database grows.
- Call to action: **“Choose a target. Define the conditions. Find the Earth
  analog.”**
- GitHub: `https://github.com/JOSEPHGABRIEL01/Mars_Map_Space_Apps`

**Visual direction:**

- Return to the Earth/Moon/Mars visual from Slide 1.
- End with a simple three-word sequence:
  **Explore → Compare → Prepare**
- Include the repository URL and the NASA Space Apps prototype disclaimer.

**Speaker note:**  
NASA Analog Finder is a practical bridge between open planetary data and Earth
field science. Its long-term value is not one fixed list of places, but a
reproducible method that can evolve as missions and datasets evolve.

## Reference list to include in the final slide or speaker notes

Use compact source labels on slides and put the full list below in speaker
notes or a small “Sources” footer:

1. NASA Lunar Reconnaissance Orbiter (LRO) LOLA — lunar topography and
   elevation data.
2. NASA LRO Diviner — lunar surface thermal observations.
3. NASA Mars Global Surveyor (MGS) MOLA — Mars topography and elevation.
4. NASA Mars Reconnaissance Orbiter (MRO) HiRISE and CRISM — high-resolution
   imagery and mineralogical context.
5. NASA Mars Science Laboratory (Curiosity) REMS — surface environmental
   measurements.
6. NASA Mars 2020 Perseverance MEDA and Mastcam-Z — atmospheric/environmental
   and surface context.
7. Microsoft Planetary Computer STAC API —
   `https://planetarycomputer.microsoft.com/api/stac/v1`
8. NASADEM 30 m — Earth elevation/topography.
9. MODIS MOD11A1 — Earth land-surface temperature.
10. Landsat Collection 2 Level-2 / OLI-TIRS — Earth surface reflectance and
    derived indices such as NDVI.
11. MODIS aerosol-related observations — Earth dust/aerosol context.
12. Project repository —
    `https://github.com/JOSEPHGABRIEL01/Mars_Map_Space_Apps`
13. Technical and strategic project report supplied by the team:
    **“Informe Técnico y Estratégico — NASA Analog Finder.”**

## Final quality constraints for Gamma

- Maximum: **7 slides total**.
- Language: **English**.
- Tone: confident, technical, concise, scientifically responsible.
- Do not use the report’s older “600+ Earth sites” or “80/20 hybrid ranking”
  claims as current delivered functionality unless the team explicitly
  verifies that those features are present in the demo being presented.
- Do not call the weighted Gaussian model machine learning.
- Do not imply that the interface proves habitability or identifies a final
  Moon/Mars landing site.
- Make the customization interface and data provenance visible; they are core
  differentiators, not secondary features.
