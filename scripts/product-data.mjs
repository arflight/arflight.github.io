// Single source of truth for Line Up's public, pilot-facing features.
// Follow devtools/skills/writing-standards/SKILL.md: plain, direct copy, no AI slop, no internal IP.

export const PRODUCT = {
  name: 'Line Up',
  tagline: 'Your path, in sight.',
  origin: 'https://flylineup.com',
}

export const FEATURE_GROUPS = [
  {
    id: 'approaches',
    eyebrow: 'Guidance',
    title: 'Approaches and highway in the sky',
    summary:
      'Project the approach path into your windscreen, aligned with the runway. Four-corner gates show lateral and vertical position down final while leaving the runway aim point clear.',
    items: [
      {
        name: 'VFR and instrument approach paths',
        detail:
          'Conformal glidepaths to the runway threshold with lateral and vertical deviation cues.',
      },
      {
        name: 'Flight path vector',
        detail:
          'A circle-and-wings marker shows the aircraft flight path over the ground, accounting for wind drift.',
      },
      {
        name: 'Waypoint altitude constraints',
        detail:
          'Fixes and crossing altitudes appear along the path ahead for step-downs and top of descent.',
      },
      {
        name: 'Performance-aware turns and descents',
        detail:
          'Turn radii and descent paths use your aircraft type and standard-rate bank limits.',
      },
    ],
  },
  {
    id: 'patterns',
    eyebrow: 'Terminal area',
    title: 'Traffic patterns and Direct-To',
    summary:
      'Orient yourself at unfamiliar and non-towered airports with visual pattern legs, runway markers, and Direct-To guidance in your field of view.',
    items: [
      {
        name: 'Visual traffic pattern guidance',
        detail:
          'Entry, downwind, base, and final alignment cues with selectable standard, wide, and extended pattern shapes.',
      },
      {
        name: 'Airport and runway markers',
        detail:
          'Distant airport brackets and runway outlines help you locate the field and confirm runway alignment.',
      },
      {
        name: 'Direct-To and nearest airport',
        detail:
          'Direct guidance to a fix or nearest airport with distance, bearing, and runway alignment.',
      },
    ],
  },
  {
    id: 'awareness',
    eyebrow: 'Situational awareness',
    title: 'Traffic, terrain, and weather',
    summary:
      'Track nearby aircraft, rising terrain, and weather hazards with visual markers and headset audio callouts.',
    items: [
      {
        name: 'Traffic markers and callouts',
        detail:
          'Conformal brackets show relative altitude and climb or descent trend, paired with spoken callouts stating bearing, distance, and altitude.',
      },
      {
        name: 'Terrain and obstacle alerts',
        detail:
          'Look-ahead alerts warn of rising terrain and charted obstacles. Alerts remain off during normal flight.',
      },
      {
        name: 'Weather briefings with timestamps',
        detail:
          'Preflight briefings, radar overlays, and station reports display observation time and age. Reports past their age limit are hidden.',
      },
    ],
  },
  {
    id: 'cockpit',
    eyebrow: 'Cockpit workflow',
    title: 'Companion app and checklists',
    summary:
      'Portable setup for owner-flown and rental aircraft with offline data, explicit readback, and phase-aware checklists.',
    items: [
      {
        name: 'Readback before display',
        detail:
          'Confirm every runway, approach, or route selection on a readback card before it changes the HUD.',
      },
      {
        name: 'Phase-aware checklists',
        detail:
          'Checklists follow each phase of flight from preflight through shutdown.',
      },
      {
        name: 'Runway-ahead cues on taxi',
        detail:
          'Visual and audio cues identify approaching runways while taxiing.',
      },
      {
        name: 'Offline operation',
        detail:
          'Airports, terrain, obstacles, procedures, and checklists load onto your device before engine start.',
      },
    ],
  },
]

export const STATIC_PAGES = ['/', '/safety.html']
