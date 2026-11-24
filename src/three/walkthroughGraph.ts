import type { DirectionCode } from '../types/realEstate';

export type TourZone = 'exterior' | 'floor' | 'interior';

export type SubZoneType =
  | 'front-gate'
  | 'reception'
  | 'right-side'
  | 'back-garden'
  | 'pool'
  | 'clubhouse'
  | 'jogging'
  | 'play'
  | 'parking'
  | 'lift'
  | 'stairs'
  | 'corridor'
  | 'flat-gate'
  | 'hall'
  | 'dining'
  | 'kitchen'
  | 'utility'
  | 'bedroom-1'
  | 'bath-1'
  | 'balcony'
  | 'bedroom-2'
  | 'bath-2';

export interface TourHotspot3D {
  id: string;
  position: [number, number, number];
  title: string;
  detail: string;
  targetNodeId?: string;
  action?: 'enter-flat' | 'inspect-floor';
}

export interface TourNode3D {
  id: string;
  title: string;
  shortLabel: string;
  zone: TourZone;
  subZone: SubZoneType;
  position: [number, number, number];
  defaultYaw: number;
  defaultPitch: number;
  compassHeadingLabel: string;
  description: string;
  connections: {
    forwardNodeId?: string;
    forwardLabel?: string;
    backwardNodeId?: string;
    backwardLabel?: string;
    leftNodeId?: string;
    leftLabel?: string;
    rightNodeId?: string;
    rightLabel?: string;
  };
  hotspots: TourHotspot3D[];
}

export const FLOOR_HEIGHT_METERS = 3.4;
export const EYE_HEIGHT_METERS = 1.65;

interface ProjectSiteOffsets {
  poolPos: [number, number, number];
  poolYaw: number;
  clubPos: [number, number, number];
  clubYaw: number;
  playPos: [number, number, number];
  playYaw: number;
  jogPos: [number, number, number];
  jogYaw: number;
  parkPos: [number, number, number];
  parkYaw: number;
  gardenPos: [number, number, number];
  gardenYaw: number;
  taglineNote: string;
}

const SITE_LAYOUTS: Record<string, ProjectSiteOffsets> = {
  'sky-crest-residences': {
    poolPos: [9.5, EYE_HEIGHT_METERS, 18.5],
    poolYaw: 215,
    clubPos: [-9.5, EYE_HEIGHT_METERS, 18.0],
    clubYaw: 145,
    playPos: [-16.5, EYE_HEIGHT_METERS, -5.0],
    playYaw: 90,
    jogPos: [16.5, EYE_HEIGHT_METERS, 4.0],
    jogYaw: 180,
    parkPos: [-15.5, EYE_HEIGHT_METERS, 6.0],
    parkYaw: 75,
    gardenPos: [0.0, EYE_HEIGHT_METERS, 18.5],
    gardenYaw: 0,
    taglineNote: 'Travertine block, lap pool deck, pergola clubhouse, and shaded jogging loop.',
  },
  'aurelia-heights': {
    poolPos: [-10.0, EYE_HEIGHT_METERS, 17.5],
    poolYaw: 135,
    clubPos: [10.5, EYE_HEIGHT_METERS, 17.5],
    clubYaw: 220,
    playPos: [17.0, EYE_HEIGHT_METERS, -3.5],
    playYaw: 255,
    jogPos: [-17.0, EYE_HEIGHT_METERS, 5.0],
    jogYaw: 170,
    parkPos: [-15.0, EYE_HEIGHT_METERS, -7.0],
    parkYaw: 100,
    gardenPos: [0.0, EYE_HEIGHT_METERS, 19.0],
    gardenYaw: 0,
    taglineNote: 'Rounded sandstone corner facade, fountain plaza, lagoon pool, and curved botanical trail.',
  },
  'saffron-quarters': {
    poolPos: [0.0, EYE_HEIGHT_METERS, 19.5],
    poolYaw: 0,
    clubPos: [13.5, EYE_HEIGHT_METERS, 14.5],
    clubYaw: 240,
    playPos: [-14.0, EYE_HEIGHT_METERS, 14.5],
    playYaw: 115,
    jogPos: [17.5, EYE_HEIGHT_METERS, 1.0],
    jogYaw: 185,
    parkPos: [-16.5, EYE_HEIGHT_METERS, -4.5],
    parkYaw: 85,
    gardenPos: [-6.0, EYE_HEIGHT_METERS, 16.5],
    gardenYaw: 15,
    taglineNote: 'Stepped terrace block with planted decks, sunken courtyard pool, and cedar clubhouse.',
  },
  'blue-bay-terrace': {
    poolPos: [0.0, EYE_HEIGHT_METERS, 21.0],
    poolYaw: 180,
    clubPos: [-13.5, EYE_HEIGHT_METERS, 17.5],
    clubYaw: 130,
    playPos: [15.5, EYE_HEIGHT_METERS, -6.5],
    playYaw: 245,
    jogPos: [16.5, EYE_HEIGHT_METERS, 12.5],
    jogYaw: 205,
    parkPos: [-16.5, EYE_HEIGHT_METERS, 2.0],
    parkYaw: 90,
    gardenPos: [8.5, EYE_HEIGHT_METERS, 17.0],
    gardenYaw: 330,
    taglineNote: 'Limestone & glass lakefront tower, infinity edge pool, timber boardwalk, and sky pavilion.',
  },
};

export function getDirectionCameraPose(
  dir: DirectionCode,
): { position: [number, number, number]; yaw: number; nodeId: string } {
  switch (dir) {
    case 'N':
      return { position: [0, EYE_HEIGHT_METERS, -21.5], yaw: 180, nodeId: 'ext-front' };
    case 'NE':
      return { position: [17.5, EYE_HEIGHT_METERS, -17.5], yaw: 225, nodeId: 'ext-right' };
    case 'E':
      return { position: [21.5, EYE_HEIGHT_METERS, 0], yaw: 270, nodeId: 'ext-right' };
    case 'SE':
      return { position: [17.5, EYE_HEIGHT_METERS, 18.5], yaw: 315, nodeId: 'ext-back' };
    case 'S':
      return { position: [0, EYE_HEIGHT_METERS, 23.0], yaw: 0, nodeId: 'ext-back' };
    case 'SW':
      return { position: [-17.5, EYE_HEIGHT_METERS, 18.5], yaw: 45, nodeId: 'ext-left' };
    case 'W':
      return { position: [-21.5, EYE_HEIGHT_METERS, 0], yaw: 90, nodeId: 'ext-left' };
    case 'NW':
      return { position: [-17.5, EYE_HEIGHT_METERS, -17.5], yaw: 135, nodeId: 'ext-front' };
  }
}

export function buildWalkthroughGraph(
  ventureId: string,
  ventureName: string,
  floorIndex: number,
  floorLabel: string,
  flatNumber: string,
): TourNode3D[] {
  const site = SITE_LAYOUTS[ventureId] ?? SITE_LAYOUTS['sky-crest-residences'];
  const floorY = floorIndex * FLOOR_HEIGHT_METERS;
  const eyeY = floorY + EYE_HEIGHT_METERS;

  return [
    // =========================================================================
    // 1. OUTSIDE BUILDING, GROUNDS & AMENITIES
    // =========================================================================
    {
      id: 'ext-front',
      title: `${ventureName} — Main Gate & Avenue`,
      shortLabel: 'Front Gate',
      zone: 'exterior',
      subZone: 'front-gate',
      position: [0, EYE_HEIGHT_METERS, -20.5],
      defaultYaw: 180, // Looking South at the building front elevation
      defaultPitch: 4,
      compassHeadingLabel: 'Front Elevation (North)',
      description: `Standing on the front avenue facing ${ventureName}. ${site.taglineNote}`,
      connections: {
        forwardNodeId: 'ext-reception',
        forwardLabel: 'Reception Lobby',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Rear Gardens',
        leftNodeId: 'ext-right',
        leftLabel: 'East Jogging Track',
        rightNodeId: 'ext-left',
        rightLabel: 'West Parking',
      },
      hotspots: [
        {
          id: 'hs-front-rec',
          position: [0, 2.2, -9.2],
          title: 'Enter Main Reception',
          detail: 'Walk through the architectural canopy into the reception lounge.',
          targetNodeId: 'ext-reception',
        },
        {
          id: 'hs-front-flat',
          position: [3.2, 2.5, -9.2],
          title: 'Select Floor & Flat',
          detail: 'Jump directly to any floor corridor or apartment interior.',
          action: 'enter-flat',
        },
        {
          id: 'hs-front-play',
          position: [site.playPos[0] * 0.65, 1.5, site.playPos[2] - 2],
          title: "Children's Play Park",
          detail: 'Explore landscaped play court and shaded seating.',
          targetNodeId: 'ext-play',
        },
      ],
    },
    {
      id: 'ext-reception',
      title: 'Main Entrance & Reception Lounge',
      shortLabel: 'Reception',
      zone: 'exterior',
      subZone: 'reception',
      position: [0, EYE_HEIGHT_METERS, -7.2],
      defaultYaw: 180,
      defaultPitch: 0,
      compassHeadingLabel: 'Ground Lobby',
      description:
        'Double-height marble reception concierge lounge with direct elevator access to all residential floors and garden doors.',
      connections: {
        forwardNodeId: 'floor-lift',
        forwardLabel: `Take Lift to ${floorLabel}`,
        backwardNodeId: 'ext-front',
        backwardLabel: 'Outside Main Gate',
        leftNodeId: 'ext-right',
        leftLabel: 'East Gardens',
        rightNodeId: 'ext-left',
        rightLabel: 'West Parking',
      },
      hotspots: [
        {
          id: 'hs-rec-lift',
          position: [-2.0, 1.9, -4.5],
          title: `Lift to ${floorLabel}`,
          detail: `Ride elevator up to ${floorLabel} lobby.`,
          targetNodeId: 'floor-lift',
        },
        {
          id: 'hs-rec-garden',
          position: [0, 1.7, 1.0],
          title: 'Step to Rear Gardens',
          detail: 'Walk through lobby terrace to the swimming pool & lawns.',
          targetNodeId: 'ext-back',
        },
      ],
    },
    {
      id: 'ext-right',
      title: 'Right Side — East Parkway & Lawn',
      shortLabel: 'Right Side',
      zone: 'exterior',
      subZone: 'right-side',
      position: [17.5, EYE_HEIGHT_METERS, -2.5],
      defaultYaw: 265,
      defaultPitch: 3,
      compassHeadingLabel: 'East Elevation',
      description:
        'Eastern garden setback lined with botanical trees, timber seating benches, and the perimeter jogging loop.',
      connections: {
        forwardNodeId: 'ext-jogging',
        forwardLabel: 'Jogging Track',
        backwardNodeId: 'ext-front',
        backwardLabel: 'Front Gate',
        leftNodeId: 'ext-back',
        leftLabel: 'Rear Gardens',
        rightNodeId: 'ext-front',
        rightLabel: 'Main Avenue',
      },
      hotspots: [
        {
          id: 'hs-r-jog',
          position: [15.8, 1.4, 5.5],
          title: 'Jogging & Walking Track',
          detail: 'Follow the shaded perimeter walkway.',
          targetNodeId: 'ext-jogging',
        },
      ],
    },
    {
      id: 'ext-back',
      title: 'Back Side — Landscaped Gardens & Lawn',
      shortLabel: 'Gardens',
      zone: 'exterior',
      subZone: 'back-garden',
      position: site.gardenPos,
      defaultYaw: site.gardenYaw,
      defaultPitch: 4,
      compassHeadingLabel: 'South Courtyard',
      description:
        'Lush botanical courtyard featuring manicured lawns, shaded pergolas, flowering planter beds, and rear balcony facades.',
      connections: {
        forwardNodeId: 'ext-pool',
        forwardLabel: 'Swimming Pool',
        backwardNodeId: 'ext-front',
        backwardLabel: 'Front Gate',
        leftNodeId: 'ext-clubhouse',
        leftLabel: 'Clubhouse',
        rightNodeId: 'ext-jogging',
        rightLabel: 'Jogging Track',
      },
      hotspots: [
        {
          id: 'hs-g-pool',
          position: [site.poolPos[0], 1.2, site.poolPos[2]],
          title: 'Swimming Pool Deck',
          detail: 'Walk over to the resort pool and loungers.',
          targetNodeId: 'ext-pool',
        },
        {
          id: 'hs-g-club',
          position: [site.clubPos[0], 1.8, site.clubPos[2]],
          title: 'Clubhouse Pavilion',
          detail: 'Visit the resident lounge and indoor recreation terrace.',
          targetNodeId: 'ext-clubhouse',
        },
      ],
    },
    {
      id: 'ext-pool',
      title: 'Swimming Pool & Lounger Deck',
      shortLabel: 'Pool Deck',
      zone: 'exterior',
      subZone: 'pool',
      position: site.poolPos,
      defaultYaw: site.poolYaw,
      defaultPitch: -4,
      compassHeadingLabel: 'Poolside Terrace',
      description:
        'Resident swimming pool with non-slip travertine coping, poolside sun loungers, and shaded garden pergolas.',
      connections: {
        forwardNodeId: 'ext-clubhouse',
        forwardLabel: 'Clubhouse Lounge',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Central Lawn',
        leftNodeId: 'ext-jogging',
        leftLabel: 'Jogging Track',
        rightNodeId: 'ext-play',
        rightLabel: 'Play Area',
      },
      hotspots: [
        {
          id: 'hs-p-club',
          position: [site.clubPos[0], 1.8, site.clubPos[2]],
          title: 'Clubhouse Terrace',
          detail: 'Step inside the resident clubhouse pavilion.',
          targetNodeId: 'ext-clubhouse',
        },
      ],
    },
    {
      id: 'ext-clubhouse',
      title: 'Clubhouse & Recreational Pavilion',
      shortLabel: 'Clubhouse',
      zone: 'exterior',
      subZone: 'clubhouse',
      position: site.clubPos,
      defaultYaw: site.clubYaw,
      defaultPitch: 0,
      compassHeadingLabel: 'Clubhouse Lounge',
      description:
        'Architectural resident clubhouse with indoor lounge seating, fitness studio glazing, and terrace overlooking the pool.',
      connections: {
        forwardNodeId: 'ext-pool',
        forwardLabel: 'Pool Deck',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Courtyard Lawn',
        leftNodeId: 'ext-play',
        leftLabel: "Children's Play Area",
        rightNodeId: 'ext-left',
        rightLabel: 'Parking Bays',
      },
      hotspots: [
        {
          id: 'hs-c-back',
          position: [0, 1.5, 16.5],
          title: 'Courtyard Gardens',
          detail: 'Walk along the landscaped botanical lawn.',
          targetNodeId: 'ext-back',
        },
      ],
    },
    {
      id: 'ext-jogging',
      title: 'Walking & Jogging Track',
      shortLabel: 'Jogging Track',
      zone: 'exterior',
      subZone: 'jogging',
      position: site.jogPos,
      defaultYaw: site.jogYaw,
      defaultPitch: 0,
      compassHeadingLabel: 'Perimeter Trail',
      description:
        'Dedicated cushioned walking and jogging track bordered by mature shade trees, ornamental grasses, and park benches.',
      connections: {
        forwardNodeId: 'ext-back',
        forwardLabel: 'Rear Gardens',
        backwardNodeId: 'ext-right',
        backwardLabel: 'East Elevation',
        leftNodeId: 'ext-pool',
        leftLabel: 'Swimming Pool',
        rightNodeId: 'ext-front',
        rightLabel: 'Front Gate',
      },
      hotspots: [],
    },
    {
      id: 'ext-play',
      title: "Children's Play Area & Botanical Park",
      shortLabel: 'Play Area',
      zone: 'exterior',
      subZone: 'play',
      position: site.playPos,
      defaultYaw: site.playYaw,
      defaultPitch: -2,
      compassHeadingLabel: 'Play Zone',
      description:
        'Safe cushioned children’s play zone with climbing frame, swings, shaded parent seating, and garden greenery.',
      connections: {
        forwardNodeId: 'ext-front',
        forwardLabel: 'Main Gate',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Courtyard Lawn',
        leftNodeId: 'ext-left',
        leftLabel: 'Parking Driveway',
        rightNodeId: 'ext-clubhouse',
        rightLabel: 'Clubhouse',
      },
      hotspots: [],
    },
    {
      id: 'ext-left',
      title: 'Left Side — Covered Parking & Driveway',
      shortLabel: 'Parking',
      zone: 'exterior',
      subZone: 'parking',
      position: site.parkPos,
      defaultYaw: site.parkYaw,
      defaultPitch: 0,
      compassHeadingLabel: 'West Driveway',
      description:
        'Tree-lined western service avenue with covered EV-ready parking bays, clear vehicle turning radius, and basement ramp.',
      connections: {
        forwardNodeId: 'ext-front',
        forwardLabel: 'Front Gate',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Rear Gardens',
        leftNodeId: 'ext-play',
        leftLabel: 'Play Park',
        rightNodeId: 'ext-clubhouse',
        rightLabel: 'Clubhouse',
      },
      hotspots: [
        {
          id: 'hs-l-front',
          position: [0, 1.8, -16.0],
          title: 'Main Street Entrance',
          detail: 'Walk to the front avenue reception gate.',
          targetNodeId: 'ext-front',
        },
      ],
    },

    // =========================================================================
    // 2. FLOOR-BY-FLOOR COMMON AREAS (LIFT LOBBY, STAIRCASE, CORRIDOR)
    // =========================================================================
    {
      id: 'floor-lift',
      title: `${floorLabel} — Lift Lobby`,
      shortLabel: 'Lift Lobby',
      zone: 'floor',
      subZone: 'lift',
      position: [-2.4, eyeY, -4.4],
      defaultYaw: 155,
      defaultPitch: 0,
      compassHeadingLabel: `${floorLabel} Core`,
      description: `Elevator landing on ${floorLabel}. Step into the bright residential corridor or inspect the architectural staircase.`,
      connections: {
        forwardNodeId: 'floor-corridor',
        forwardLabel: 'Floor Corridor',
        rightNodeId: 'floor-stairs',
        rightLabel: 'Staircase',
        backwardNodeId: 'ext-reception',
        backwardLabel: 'Ground Reception',
      },
      hotspots: [
        {
          id: 'hs-lift-corr',
          position: [0, floorY + 1.5, -2.2],
          title: 'Walk Floor Corridor',
          detail: 'View all apartment entrances on this floor.',
          targetNodeId: 'floor-corridor',
        },
        {
          id: 'hs-lift-stairs',
          position: [2.4, floorY + 1.5, -4.4],
          title: 'Staircase Landing',
          detail: 'Inspect sunlit ventilated stairwell.',
          targetNodeId: 'floor-stairs',
        },
      ],
    },
    {
      id: 'floor-stairs',
      title: `${floorLabel} — Staircase Landing`,
      shortLabel: 'Staircase',
      zone: 'floor',
      subZone: 'stairs',
      position: [2.6, eyeY, -4.4],
      defaultYaw: 205,
      defaultPitch: -4,
      compassHeadingLabel: `${floorLabel} Stairwell`,
      description: `Daylit architectural staircase on ${floorLabel} with solid timber handrails and anti-skid stone treads.`,
      connections: {
        forwardNodeId: 'floor-corridor',
        forwardLabel: 'Floor Corridor',
        leftNodeId: 'floor-lift',
        leftLabel: 'Lift Lobby',
        backwardNodeId: 'ext-reception',
        backwardLabel: 'Ground Reception',
      },
      hotspots: [
        {
          id: 'hs-stair-corr',
          position: [0.4, floorY + 1.5, -2.2],
          title: 'Enter Floor Corridor',
          detail: 'Proceed to flat entrances.',
          targetNodeId: 'floor-corridor',
        },
      ],
    },
    {
      id: 'floor-corridor',
      title: `${floorLabel} — Apartment Corridor`,
      shortLabel: 'Corridor',
      zone: 'floor',
      subZone: 'corridor',
      position: [0, eyeY, -2.2],
      defaultYaw: 180,
      defaultPitch: 0,
      compassHeadingLabel: `${floorLabel} Hallway`,
      description: `Private floor corridor serving residences on ${floorLabel}. Click Flat ${flatNumber} entrance door ahead to step inside.`,
      connections: {
        forwardNodeId: 'flat-gate',
        forwardLabel: `Enter Flat ${flatNumber}`,
        backwardNodeId: 'floor-lift',
        backwardLabel: 'Lift Lobby',
        leftNodeId: 'floor-stairs',
        leftLabel: 'Staircase',
        rightNodeId: 'floor-lift',
        rightLabel: 'Lift Lobby',
      },
      hotspots: [
        {
          id: 'hs-corr-flatgate',
          position: [0, floorY + 1.5, -0.7],
          title: `Enter Flat ${flatNumber} Gate`,
          detail: `Step inside Flat ${flatNumber} on ${floorLabel}.`,
          targetNodeId: 'flat-gate',
        },
      ],
    },

    // =========================================================================
    // 3. INSIDE SELECTED FLAT (ROOM-BY-ROOM WALKTHROUGH AT ACTUAL FLOOR HEIGHT)
    // =========================================================================
    {
      id: 'flat-gate',
      title: `Flat ${flatNumber} — Entrance Gate & Foyer`,
      shortLabel: 'Flat Gate',
      zone: 'interior',
      subZone: 'flat-gate',
      position: [0, eyeY, -0.4],
      defaultYaw: 180,
      defaultPitch: -2,
      compassHeadingLabel: `${floorLabel} · Flat ${flatNumber}`,
      description: `Main timber entrance threshold of Flat ${flatNumber}. Step straight ahead into the Main Living Hall.`,
      connections: {
        forwardNodeId: 'flat-hall',
        forwardLabel: 'Enter Main Hall',
        backwardNodeId: 'floor-corridor',
        backwardLabel: 'Exit to Corridor',
      },
      hotspots: [
        {
          id: 'hs-gate-hall',
          position: [0, floorY + 1.4, 2.3],
          title: 'Step into Main Hall',
          detail: 'Walk into the central living pavilion.',
          targetNodeId: 'flat-hall',
        },
      ],
    },
    {
      id: 'flat-hall',
      title: `Flat ${flatNumber} — Main Hall (Living Room)`,
      shortLabel: 'Living Room',
      zone: 'interior',
      subZone: 'hall',
      position: [0, eyeY, 2.5],
      defaultYaw: 180,
      defaultPitch: -2,
      compassHeadingLabel: `Central Living Hub`,
      description:
        'Open living room with herringbone oak flooring. Right: Dining & Open Kitchen · Straight Left: Master Bedroom & Balcony · Right Straight → Left: Second Bedroom.',
      connections: {
        forwardNodeId: 'flat-dining',
        forwardLabel: 'Dining & Kitchen (Right)',
        rightNodeId: 'flat-kitchen',
        rightLabel: 'Open Kitchen',
        leftNodeId: 'flat-bedroom-1',
        leftLabel: 'Straight Left: Master Bedroom',
        backwardNodeId: 'flat-gate',
        backwardLabel: 'Entrance Gate',
      },
      hotspots: [
        {
          id: 'hs-hall-kit',
          position: [-4.0, floorY + 1.35, 2.5],
          title: 'Open Kitchen (Right)',
          detail: 'Walk right to the breakfast island & modular kitchen.',
          targetNodeId: 'flat-kitchen',
        },
        {
          id: 'hs-hall-din',
          position: [-2.4, floorY + 1.2, 4.4],
          title: 'Dining Area',
          detail: 'Six-seater marble dining zone overlooking courtyard.',
          targetNodeId: 'flat-dining',
        },
        {
          id: 'hs-hall-b1',
          position: [3.8, floorY + 1.4, 4.2],
          title: 'Master Bedroom (Straight Left)',
          detail: 'Primary suite with attached bathroom and rear balcony.',
          targetNodeId: 'flat-bedroom-1',
        },
        {
          id: 'hs-hall-b2',
          position: [-3.8, floorY + 1.4, 6.2],
          title: 'Bedroom 2 (Right → Straight)',
          detail: 'Second bedroom wing with ensuite bath.',
          targetNodeId: 'flat-bedroom-2',
        },
        {
          id: 'hs-hall-bal',
          position: [2.2, floorY + 1.5, 7.6],
          title: 'Backside Balcony',
          detail: 'Look out over the gardens and pool deck.',
          targetNodeId: 'flat-balcony',
        },
      ],
    },
    {
      id: 'flat-dining',
      title: `Flat ${flatNumber} — Dining Area`,
      shortLabel: 'Dining',
      zone: 'interior',
      subZone: 'dining',
      position: [-2.4, eyeY, 4.4],
      defaultYaw: 250,
      defaultPitch: -4,
      compassHeadingLabel: 'Dining Pavilion',
      description:
        'Sunlit six-seat dining suite connecting the living room and open travertine kitchen island.',
      connections: {
        forwardNodeId: 'flat-kitchen',
        forwardLabel: 'Open Kitchen',
        rightNodeId: 'flat-bedroom-2',
        rightLabel: 'Bedroom 2',
        leftNodeId: 'flat-hall',
        leftLabel: 'Main Hall',
        backwardNodeId: 'flat-hall',
        backwardLabel: 'Living Room',
      },
      hotspots: [
        {
          id: 'hs-din-kit',
          position: [-4.6, floorY + 1.3, 2.3],
          title: 'Open Kitchen',
          detail: 'Step behind the breakfast island.',
          targetNodeId: 'flat-kitchen',
        },
      ],
    },
    {
      id: 'flat-kitchen',
      title: `Flat ${flatNumber} — Open Kitchen`,
      shortLabel: 'Kitchen',
      zone: 'interior',
      subZone: 'kitchen',
      position: [-4.8, eyeY, 2.3],
      defaultYaw: 270,
      defaultPitch: -4,
      compassHeadingLabel: 'Right Wing · Kitchen',
      description:
        'Open kitchen on the right side of the hall with travertine island, brass fixtures, induction hob, and utility access.',
      connections: {
        forwardNodeId: 'flat-utility',
        forwardLabel: 'Utility Area',
        leftNodeId: 'flat-hall',
        leftLabel: 'Main Hall',
        rightNodeId: 'flat-bedroom-2',
        rightLabel: 'Bedroom 2',
        backwardNodeId: 'flat-dining',
        backwardLabel: 'Dining Area',
      },
      hotspots: [
        {
          id: 'hs-kit-util',
          position: [-6.0, floorY + 1.4, 4.4],
          title: 'Utility Area',
          detail: 'Step into the ventilated laundry & utility bay.',
          targetNodeId: 'flat-utility',
        },
        {
          id: 'hs-kit-hall',
          position: [-0.8, floorY + 1.4, 2.5],
          title: 'Back to Main Hall',
          detail: 'Return to living room hub.',
          targetNodeId: 'flat-hall',
        },
      ],
    },
    {
      id: 'flat-utility',
      title: `Flat ${flatNumber} — Utility & Laundry Area`,
      shortLabel: 'Utility',
      zone: 'interior',
      subZone: 'utility',
      position: [-6.0, eyeY, 4.5],
      defaultYaw: 260,
      defaultPitch: -4,
      compassHeadingLabel: 'Service Bay',
      description:
        'Dedicated service utility bay behind the kitchen with stone wash counter, washer recess, and exterior louver ventilation.',
      connections: {
        backwardNodeId: 'flat-kitchen',
        backwardLabel: 'Open Kitchen',
        leftNodeId: 'flat-bedroom-2',
        leftLabel: 'Bedroom 2',
      },
      hotspots: [],
    },
    {
      id: 'flat-bedroom-1',
      title: `Flat ${flatNumber} — Master Bedroom (Straight Left)`,
      shortLabel: 'Master Bed',
      zone: 'interior',
      subZone: 'bedroom-1',
      position: [4.6, eyeY, 4.5],
      defaultYaw: 120,
      defaultPitch: -3,
      compassHeadingLabel: 'Left Wing · Primary Suite',
      description:
        'Straight left from the hall: Master bedroom with king bed, full wardrobes, attached bathroom, and sliding glass doors to the backside balcony.',
      connections: {
        forwardNodeId: 'flat-balcony',
        forwardLabel: 'Backside Balcony',
        leftNodeId: 'flat-bath-1',
        leftLabel: 'Attached Bathroom 1',
        rightNodeId: 'flat-hall',
        rightLabel: 'Back to Hall',
        backwardNodeId: 'flat-hall',
        backwardLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: 'hs-b1-bath',
          position: [6.0, floorY + 1.4, 1.9],
          title: 'Attached Bathroom 1',
          detail: 'Enter the master ensuite bathroom.',
          targetNodeId: 'flat-bath-1',
        },
        {
          id: 'hs-b1-bal',
          position: [3.6, floorY + 1.4, 7.8],
          title: 'Backside Balcony',
          detail: 'Step onto the private balcony overlooking the gardens.',
          targetNodeId: 'flat-balcony',
        },
      ],
    },
    {
      id: 'flat-bath-1',
      title: `Flat ${flatNumber} — Attached Bathroom 1`,
      shortLabel: 'Bathroom 1',
      zone: 'interior',
      subZone: 'bath-1',
      position: [6.0, eyeY, 1.6],
      defaultYaw: 15,
      defaultPitch: -5,
      compassHeadingLabel: 'Master Ensuite',
      description:
        'Honed limestone ensuite bathroom with floating timber vanity, brass mirror lighting, and frameless walk-in glass shower.',
      connections: {
        backwardNodeId: 'flat-bedroom-1',
        backwardLabel: 'Back to Master Bed',
        rightNodeId: 'flat-hall',
        rightLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: 'hs-bath1-b1',
          position: [4.8, floorY + 1.4, 3.6],
          title: 'Return to Master Bedroom',
          detail: 'Step back into primary suite.',
          targetNodeId: 'flat-bedroom-1',
        },
      ],
    },
    {
      id: 'flat-balcony',
      title: `Flat ${flatNumber} — Backside Private Balcony`,
      shortLabel: 'Balcony',
      zone: 'interior',
      subZone: 'balcony',
      position: [3.6, eyeY, 8.3],
      defaultYaw: 185,
      defaultPitch: -8,
      compassHeadingLabel: `${floorLabel} · Courtyard View`,
      description: `Private backside balcony on ${floorLabel} with frameless glass railing overlooking the landscaped gardens, pool deck, and clubhouse below.`,
      connections: {
        forwardNodeId: 'flat-bedroom-1',
        forwardLabel: 'Master Bedroom',
        rightNodeId: 'flat-hall',
        rightLabel: 'Main Hall',
        backwardNodeId: 'ext-back',
        backwardLabel: 'Go Down to Gardens',
      },
      hotspots: [
        {
          id: 'hs-bal-b1',
          position: [4.4, floorY + 1.4, 5.2],
          title: 'Enter Master Bedroom',
          detail: 'Step back indoors.',
          targetNodeId: 'flat-bedroom-1',
        },
      ],
    },
    {
      id: 'flat-bedroom-2',
      title: `Flat ${flatNumber} — Second Bedroom`,
      shortLabel: 'Bedroom 2',
      zone: 'interior',
      subZone: 'bedroom-2',
      position: [-4.4, eyeY, 6.6],
      defaultYaw: 210,
      defaultPitch: -3,
      compassHeadingLabel: 'Right Straight → Bedroom 2',
      description:
        'From the hall, turn right straight and left into the second bedroom suite with corner daylight window and attached bathroom.',
      connections: {
        leftNodeId: 'flat-bath-2',
        leftLabel: 'Attached Bathroom 2',
        backwardNodeId: 'flat-hall',
        backwardLabel: 'Back to Hall',
        forwardNodeId: 'flat-dining',
        forwardLabel: 'Dining & Hall',
      },
      hotspots: [
        {
          id: 'hs-b2-bath2',
          position: [-1.8, floorY + 1.4, 7.1],
          title: 'Attached Bathroom 2',
          detail: 'Step into the second attached bathroom.',
          targetNodeId: 'flat-bath-2',
        },
        {
          id: 'hs-b2-hall',
          position: [-0.8, floorY + 1.4, 3.4],
          title: 'Back to Living Hall',
          detail: 'Return to main hall.',
          targetNodeId: 'flat-hall',
        },
      ],
    },
    {
      id: 'flat-bath-2',
      title: `Flat ${flatNumber} — Attached Bathroom 2`,
      shortLabel: 'Bathroom 2',
      zone: 'interior',
      subZone: 'bath-2',
      position: [-1.6, eyeY, 7.1],
      defaultYaw: 180,
      defaultPitch: -5,
      compassHeadingLabel: 'Bedroom 2 Ensuite',
      description:
        'Guest & Bedroom 2 ensuite bathroom finished in matte slate tile, stone countertop basin, and glass shower enclosure.',
      connections: {
        backwardNodeId: 'flat-bedroom-2',
        backwardLabel: 'Back to Bedroom 2',
        rightNodeId: 'flat-hall',
        rightLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: 'hs-bath2-b2',
          position: [-3.8, floorY + 1.4, 6.7],
          title: 'Return to Bedroom 2',
          detail: 'Exit back into Bedroom 2.',
          targetNodeId: 'flat-bedroom-2',
        },
      ],
    },
  ];
}
