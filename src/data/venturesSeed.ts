import type {
  ApartmentVenture,
  DirectionCode,
  DirectionalView,
  FlatStatus,
  FlatUnit,
  FloorPlan,
  GalleryItem,
  PanoramaNode,
} from '../types/realEstate';

const IMG = {
  hero: '/src/assets/images/hero_residence_banner_1795416772647.jpg',
  skyCrest: '/src/assets/images/apt_first_exterior_1795416772439.jpg',
  aurelia: '/src/assets/images/apt_second_exterior_1795416772887.jpg',
  saffron: '/src/assets/images/apt_third_exterior_1795416772890.jpg',
  blueBay: '/src/assets/images/apt_fourth_exterior_1795416772950.jpg',
  panoInterior: '/src/assets/images/pano_360_interior_1795416772566.jpg',
  panoRoad: '/src/assets/images/pano_360_road_1795416772401.jpg',
  panoTerrace: '/src/assets/images/pano_360_terrace_1795416772311.jpg',
  panoKitchen: '/src/assets/images/pano_360_kitchen_1795420537060.jpg',
  panoBedroom: '/src/assets/images/pano_360_bedroom_1795420536458.jpg',
  panoBathroom: '/src/assets/images/pano_360_bathroom_1795420537009.jpg',
  panoBalcony: '/src/assets/images/pano_360_balcony_1795420536812.jpg',
  suite: '/src/assets/images/gallery_interior_suite_1795416773079.jpg',
};

const FLOOR_NAMES = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
  'Fifth Floor',
];

function buildDirectionalViews(
  ventureSlug: string,
  streetFront: string,
  primaryExterior: string,
): DirectionalView[] {
  const dirs: Array<{
    direction: DirectionCode;
    label: string;
    bearingDegrees: number;
    panoramaNodeId: string;
    previewImageUrl: string;
    description: string;
    verifiedSiteNote: string;
  }> = [
    {
      direction: 'N',
      label: 'North-Facing View',
      bearingDegrees: 0,
      panoramaNodeId: `${ventureSlug}-ext-front`,
      previewImageUrl: IMG.panoRoad,
      description: `Front side facing ${streetFront} with main gate and landscaped setback.`,
      verifiedSiteNote: 'Front setback: 28 ft buffer facing North avenue.',
    },
    {
      direction: 'NE',
      label: 'North-East Corner View',
      bearingDegrees: 45,
      panoramaNodeId: `${ventureSlug}-ext-front`,
      previewImageUrl: primaryExterior,
      description: 'Corner arrival plaza and morning light lobby elevation.',
      verifiedSiteNote: 'Vastu-aligned NE corner gate entry.',
    },
    {
      direction: 'E',
      label: 'East-Facing View',
      bearingDegrees: 90,
      panoramaNodeId: `${ventureSlug}-ext-right`,
      previewImageUrl: IMG.panoInterior,
      description: 'Right side elevation with morning light living balconies.',
      verifiedSiteNote: '24 ft right-side setback along residential parkway.',
    },
    {
      direction: 'SE',
      label: 'South-East Corner View',
      bearingDegrees: 135,
      panoramaNodeId: `${ventureSlug}-ext-back`,
      previewImageUrl: IMG.panoTerrace,
      description: 'Rear-right corner overlooking courtyard deck and pergolas.',
      verifiedSiteNote: 'Deep overhangs calibrated for mid-day shade.',
    },
    {
      direction: 'S',
      label: 'South-Facing View',
      bearingDegrees: 180,
      panoramaNodeId: `${ventureSlug}-ext-back`,
      previewImageUrl: IMG.hero,
      description: 'Back side elevation overlooking private garden lawn and pool.',
      verifiedSiteNote: 'Private landscaped rear buffer.',
    },
    {
      direction: 'SW',
      label: 'South-West Corner View',
      bearingDegrees: 225,
      panoramaNodeId: `${ventureSlug}-ext-left`,
      previewImageUrl: IMG.panoRoad,
      description: 'Rear-left driveway ramp and western balcony wing.',
      verifiedSiteNote: 'Dedicated basement ramp on SW corner.',
    },
    {
      direction: 'W',
      label: 'West-Facing View',
      bearingDegrees: 270,
      panoramaNodeId: `${ventureSlug}-ext-left`,
      previewImageUrl: primaryExterior,
      description: 'Left side roadway facing tree-lined residential avenue.',
      verifiedSiteNote: '30 ft clear sightline corridor on West boundary.',
    },
    {
      direction: 'NW',
      label: 'North-West Corner View',
      bearingDegrees: 315,
      panoramaNodeId: `${ventureSlug}-ext-front`,
      previewImageUrl: IMG.panoRoad,
      description: 'Front-left corner approach from main street junction.',
      verifiedSiteNote: 'Primary vehicle drop-off turn-in.',
    },
  ];
  return dirs;
}

function buildPanoramaGraph(ventureSlug: string, ventureName: string, streetFront: string): PanoramaNode[] {
  return [
    // EXTERIOR 4 SIDES (Front, Back, Right, Left)
    {
      id: `${ventureSlug}-ext-front`,
      title: 'Front Side — Main Gate & Avenue',
      category: 'road',
      zone: 'exterior',
      exteriorSide: 'front',
      mediaType: 'image',
      mediaUrl: IMG.panoRoad,
      isPlaceholderMedia: false,
      defaultYaw: 0,
      compassHeadingLabel: 'Front Side (North)',
      description: `Outside ${ventureName} along ${streetFront}. Select a floor & flat below to enter the gate, or inspect Back, Left, and Right building sides.`,
      connections: {
        forwardNodeId: `${ventureSlug}-flat-gate`,
        forwardLabel: 'Enter Flat Gate',
        backwardNodeId: `${ventureSlug}-ext-back`,
        backwardLabel: 'Back Side',
        leftNodeId: `${ventureSlug}-ext-left`,
        leftLabel: 'Left Side',
        rightNodeId: `${ventureSlug}-ext-right`,
        rightLabel: 'Right Side',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-front-gate`,
          yaw: 0,
          pitch: 2,
          title: 'Main Apartment Gate',
          detail: 'Choose floor and flat to step inside the apartment gate.',
          targetNodeId: `${ventureSlug}-flat-gate`,
        },
        {
          id: `${ventureSlug}-hs-front-right`,
          yaw: 82,
          pitch: 0,
          title: 'Right Side Elevation',
          detail: 'Inspect East side setback and balconies.',
          targetNodeId: `${ventureSlug}-ext-right`,
        },
        {
          id: `${ventureSlug}-hs-front-left`,
          yaw: 278,
          pitch: 0,
          title: 'Left Side Avenue',
          detail: 'Inspect West driveway and parking ramp.',
          targetNodeId: `${ventureSlug}-ext-left`,
        },
      ],
    },
    {
      id: `${ventureSlug}-ext-right`,
      title: 'Right Side — East Elevation',
      category: 'exterior',
      zone: 'exterior',
      exteriorSide: 'right',
      mediaType: 'image',
      mediaUrl: IMG.panoRoad,
      isPlaceholderMedia: false,
      defaultYaw: 90,
      compassHeadingLabel: 'Right Side (East)',
      description: `Right side of ${ventureName} showing eastern balconies and 24 ft parkway setback.`,
      connections: {
        forwardNodeId: `${ventureSlug}-ext-front`,
        forwardLabel: 'Front Side',
        backwardNodeId: `${ventureSlug}-ext-back`,
        backwardLabel: 'Back Side',
        leftNodeId: `${ventureSlug}-ext-front`,
        leftLabel: 'Front Gate',
        rightNodeId: `${ventureSlug}-ext-back`,
        rightLabel: 'Back Side',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-right-front`,
          yaw: 0,
          pitch: 0,
          title: 'Return to Front Side',
          detail: 'Back to main avenue gate.',
          targetNodeId: `${ventureSlug}-ext-front`,
        },
      ],
    },
    {
      id: `${ventureSlug}-ext-left`,
      title: 'Left Side — West Driveway',
      category: 'exterior',
      zone: 'exterior',
      exteriorSide: 'left',
      mediaType: 'image',
      mediaUrl: IMG.panoRoad,
      isPlaceholderMedia: false,
      defaultYaw: 270,
      compassHeadingLabel: 'Left Side (West)',
      description: `Left side of ${ventureName} showing basement parking ramp and western street trees.`,
      connections: {
        forwardNodeId: `${ventureSlug}-ext-front`,
        forwardLabel: 'Front Side',
        backwardNodeId: `${ventureSlug}-ext-back`,
        backwardLabel: 'Back Side',
        leftNodeId: `${ventureSlug}-ext-back`,
        leftLabel: 'Back Side',
        rightNodeId: `${ventureSlug}-ext-front`,
        rightLabel: 'Front Gate',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-left-ramp`,
          yaw: 260,
          pitch: -3,
          title: 'Covered Parking Ramp',
          detail: 'Stilt and basement EV-ready bays.',
        },
      ],
    },
    {
      id: `${ventureSlug}-ext-back`,
      title: 'Back Side — Courtyard & Terrace',
      category: 'amenity',
      zone: 'exterior',
      exteriorSide: 'back',
      mediaType: 'image',
      mediaUrl: IMG.panoTerrace,
      isPlaceholderMedia: false,
      defaultYaw: 180,
      compassHeadingLabel: 'Back Side (South)',
      description: `Back side of ${ventureName} overlooking the reflection pool, courtyard garden, and rear balconies.`,
      connections: {
        forwardNodeId: `${ventureSlug}-ext-front`,
        forwardLabel: 'Front Side',
        leftNodeId: `${ventureSlug}-ext-right`,
        leftLabel: 'Right Side',
        rightNodeId: `${ventureSlug}-ext-left`,
        rightLabel: 'Left Side',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-back-pool`,
          yaw: 185,
          pitch: -8,
          title: 'Courtyard & Pool Deck',
          detail: 'Private rear garden and lounge terrace.',
        },
      ],
    },

    // INTERIOR FLAT WALKTHROUGH (Gate -> Hall -> Kitchen / Bedrooms / Bathrooms / Balcony)
    {
      id: `${ventureSlug}-flat-gate`,
      title: 'Flat Entrance Gate',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoInterior,
      isPlaceholderMedia: false,
      defaultYaw: 0,
      compassHeadingLabel: 'Flat Main Door',
      description: 'Standing at the flat entrance gate. Step forward into the Main Hall or return outside.',
      connections: {
        forwardNodeId: `${ventureSlug}-flat-hall`,
        forwardLabel: 'Enter Main Hall',
        backwardNodeId: `${ventureSlug}-ext-front`,
        backwardLabel: 'Exit Outside',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-gate-hall`,
          yaw: 0,
          pitch: -2,
          title: 'Enter First Hall',
          detail: 'Step inside the main living hall.',
          targetNodeId: `${ventureSlug}-flat-hall`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-hall`,
      title: 'Main Hall (Living Room)',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoInterior,
      isPlaceholderMedia: false,
      defaultYaw: 0,
      compassHeadingLabel: 'Central Hall Hub',
      description:
        'Right: Open Kitchen · Straight Left: Bedroom 1 (Bathroom & Back Balcony) · Right Straight → Left: Bedroom 2 (Bathroom) · Front: Entrance Gate.',
      connections: {
        forwardNodeId: `${ventureSlug}-flat-gate`,
        forwardLabel: 'Front: Entrance Gate',
        rightNodeId: `${ventureSlug}-flat-kitchen`,
        rightLabel: 'Right: Open Kitchen',
        leftNodeId: `${ventureSlug}-flat-bedroom-1`,
        leftLabel: 'Straight Left: Bedroom 1',
        backwardNodeId: `${ventureSlug}-flat-bedroom-2`,
        backwardLabel: 'Right Straight → Bedroom 2',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-hall-kitchen`,
          yaw: 82,
          pitch: -3,
          title: 'Open Kitchen (Right)',
          detail: 'Travertine island and deep-teal modular cabinetry.',
          targetNodeId: `${ventureSlug}-flat-kitchen`,
        },
        {
          id: `${ventureSlug}-hs-hall-bed1`,
          yaw: 280,
          pitch: 0,
          title: 'Bedroom 1 (Straight Left)',
          detail: 'Primary suite with attached bathroom and back balcony.',
          targetNodeId: `${ventureSlug}-flat-bedroom-1`,
        },
        {
          id: `${ventureSlug}-hs-hall-bed2`,
          yaw: 145,
          pitch: 0,
          title: 'Bedroom 2 (Right → Straight & Left)',
          detail: 'Second bedroom wing with attached bathroom.',
          targetNodeId: `${ventureSlug}-flat-bedroom-2`,
        },
        {
          id: `${ventureSlug}-hs-hall-balcony`,
          yaw: 8,
          pitch: 0,
          title: 'Balcony View',
          detail: 'Inspect outdoor glass-railing balcony.',
          targetNodeId: `${ventureSlug}-flat-balcony`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-kitchen`,
      title: 'Open Kitchen (Right of Hall)',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoKitchen,
      isPlaceholderMedia: false,
      defaultYaw: 45,
      compassHeadingLabel: 'Right Wing · Open Kitchen',
      description: 'Open kitchen on the right side of the hall with travertine island and direct view back to the living hall.',
      connections: {
        leftNodeId: `${ventureSlug}-flat-hall`,
        leftLabel: 'Main Hall',
        backwardNodeId: `${ventureSlug}-flat-hall`,
        backwardLabel: 'Back to Hall',
        forwardNodeId: `${ventureSlug}-flat-bedroom-2`,
        forwardLabel: 'Straight → Bedroom 2',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-kit-hall`,
          yaw: 235,
          pitch: 0,
          title: 'Back to Main Hall',
          detail: 'Return to living hall center.',
          targetNodeId: `${ventureSlug}-flat-hall`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-bedroom-1`,
      title: 'Bedroom 1 (Straight Left)',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoBedroom,
      isPlaceholderMedia: false,
      defaultYaw: 315,
      compassHeadingLabel: 'Left Wing · Bedroom 1',
      description: 'Straight left from the hall: Bedroom 1 with attached bathroom on the left and private balcony on the backside.',
      connections: {
        leftNodeId: `${ventureSlug}-flat-bath-1`,
        leftLabel: 'Attached Bathroom',
        backwardNodeId: `${ventureSlug}-flat-balcony`,
        backwardLabel: 'Back Balcony',
        rightNodeId: `${ventureSlug}-flat-hall`,
        rightLabel: 'Back to Hall',
        forwardNodeId: `${ventureSlug}-flat-hall`,
        forwardLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-b1-bath`,
          yaw: 60,
          pitch: -2,
          title: 'Attached Bathroom 1',
          detail: 'Step inside the ensuite bathroom.',
          targetNodeId: `${ventureSlug}-flat-bath-1`,
        },
        {
          id: `${ventureSlug}-hs-b1-balcony`,
          yaw: 5,
          pitch: 0,
          title: 'Backside Balcony',
          detail: 'Open sliding doors to the private balcony.',
          targetNodeId: `${ventureSlug}-flat-balcony`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-bath-1`,
      title: 'Attached Bathroom 1',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoBathroom,
      isPlaceholderMedia: false,
      defaultYaw: 0,
      compassHeadingLabel: 'Bedroom 1 Ensuite',
      description: 'Attached bathroom to Bedroom 1 featuring limestone walls, deep-teal vanity, and walk-in glass shower.',
      connections: {
        backwardNodeId: `${ventureSlug}-flat-bedroom-1`,
        backwardLabel: 'Back to Bedroom 1',
        rightNodeId: `${ventureSlug}-flat-bedroom-1`,
        rightLabel: 'Bedroom 1',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-bath1-out`,
          yaw: 105,
          pitch: 0,
          title: 'Return to Bedroom 1',
          detail: 'Step back into Bedroom 1.',
          targetNodeId: `${ventureSlug}-flat-bedroom-1`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-balcony`,
      title: 'Backside Balcony',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoBalcony,
      isPlaceholderMedia: false,
      defaultYaw: 180,
      compassHeadingLabel: 'Backside Private Balcony',
      description: 'Private rear balcony with frameless glass railing overlooking courtyard gardens.',
      connections: {
        forwardNodeId: `${ventureSlug}-flat-bedroom-1`,
        forwardLabel: 'Enter Bedroom 1',
        rightNodeId: `${ventureSlug}-flat-hall`,
        rightLabel: 'Main Hall',
        backwardNodeId: `${ventureSlug}-ext-back`,
        backwardLabel: 'Building Back Side',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-bal-inside`,
          yaw: 82,
          pitch: 0,
          title: 'Return Inside',
          detail: 'Step back through glass sliders.',
          targetNodeId: `${ventureSlug}-flat-bedroom-1`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-bedroom-2`,
      title: 'Bedroom 2 (Right → Straight & Left)',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoBedroom,
      isPlaceholderMedia: false,
      defaultYaw: 90,
      compassHeadingLabel: 'Right Wing · Bedroom 2',
      description: 'From Main Hall, go right straight and left into Bedroom 2 with its attached bathroom.',
      connections: {
        leftNodeId: `${ventureSlug}-flat-bath-2`,
        leftLabel: 'Attached Bathroom 2',
        backwardNodeId: `${ventureSlug}-flat-hall`,
        backwardLabel: 'Back to Hall',
        forwardNodeId: `${ventureSlug}-flat-hall`,
        forwardLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-b2-bath`,
          yaw: 60,
          pitch: -2,
          title: 'Attached Bathroom 2',
          detail: 'Inspect Bedroom 2 attached bathroom.',
          targetNodeId: `${ventureSlug}-flat-bath-2`,
        },
      ],
    },
    {
      id: `${ventureSlug}-flat-bath-2`,
      title: 'Attached Bathroom 2',
      category: 'interior',
      zone: 'interior',
      mediaType: 'image',
      mediaUrl: IMG.panoBathroom,
      isPlaceholderMedia: false,
      defaultYaw: 90,
      compassHeadingLabel: 'Bedroom 2 Ensuite',
      description: 'Attached bathroom inside Bedroom 2 wing. Return to Bedroom 2 or back to the Main Hall.',
      connections: {
        backwardNodeId: `${ventureSlug}-flat-bedroom-2`,
        backwardLabel: 'Back to Bedroom 2',
        rightNodeId: `${ventureSlug}-flat-hall`,
        rightLabel: 'Main Hall',
      },
      hotspots: [
        {
          id: `${ventureSlug}-hs-bath2-out`,
          yaw: 105,
          pitch: 0,
          title: 'Return to Bedroom 2',
          detail: 'Step back into Bedroom 2.',
          targetNodeId: `${ventureSlug}-flat-bedroom-2`,
        },
      ],
    },
  ];
}

function buildGallery(exteriorImg: string, ventureName: string): GalleryItem[] {
  return [
    {
      id: 'gal-ext',
      category: 'Building Exterior',
      title: `${ventureName} — Front Elevation`,
      caption: 'Architectural stone cladding, crisp metal louvers, and arrival canopy.',
      imageUrl: exteriorImg,
    },
    {
      id: 'gal-int',
      category: 'Building Interior',
      title: 'Main Living Hall',
      caption: 'Open-plan living and dining space with engineered oak flooring.',
      imageUrl: IMG.panoInterior,
    },
    {
      id: 'gal-ent',
      category: 'Entrance',
      title: 'Main Gate & Reception Plaza',
      caption: 'Landscaped entrance court, security desk, and lobby canopy.',
      imageUrl: IMG.blueBay,
    },
    {
      id: 'gal-liv',
      category: 'Living Room',
      title: 'Corner Living Pavilion',
      caption: 'Floor-to-ceiling glazing opening onto balcony seating.',
      imageUrl: IMG.panoInterior,
    },
    {
      id: 'gal-bed',
      category: 'Bedrooms',
      title: 'Master Bedroom Suite',
      caption: 'Natural daylight window, balcony access, and attached bathroom.',
      imageUrl: IMG.panoBedroom,
    },
    {
      id: 'gal-kit',
      category: 'Kitchen',
      title: 'Open Travertine & Navy Kitchen',
      caption: 'Custom cabinetry with travertine breakfast island and utility door.',
      imageUrl: IMG.panoKitchen,
    },
    {
      id: 'gal-bath',
      category: 'Bathrooms',
      title: 'Attached Ensuite Bathroom',
      caption: 'Honed limestone surfaces, timber vanity, and glass shower.',
      imageUrl: IMG.panoBathroom,
    },
    {
      id: 'gal-bal',
      category: 'Balconies',
      title: 'Private Sit-Out Balcony',
      caption: 'Frameless glass railing overlooking landscaped garden lawns.',
      imageUrl: IMG.panoBalcony,
    },
    {
      id: 'gal-prk',
      category: 'Parking',
      title: 'Covered Parking Driveway',
      caption: 'EV-ready stilt and basement bays.',
      imageUrl: IMG.skyCrest,
    },
    {
      id: 'gal-amn',
      category: 'Amenities',
      title: 'Swimming Pool & Clubhouse',
      caption: 'Courtyard lap pool, shaded pergolas, and resident lounge.',
      imageUrl: IMG.hero,
    },
    {
      id: 'gal-rd',
      category: 'Surrounding Roads',
      title: 'Avenue Frontage & Jogging Loop',
      caption: 'Tree-lined street, walking track, and landscaped setback.',
      imageUrl: IMG.aurelia,
    },
  ];
}

interface FloorSpecInput {
  flatsPerFloor: number;
  floorCount: number;
  landShareBase: number;
  priceMap: Record<string, string>;
  statusesByFloor: FlatStatus[][];
  bhkPattern: string[];
}

function buildFloors(venturePrefix: string, spec: FloorSpecInput): FloorPlan[] {
  const floors: FloorPlan[] = [];
  const facingCycle: DirectionCode[] = ['NE', 'NW', 'SE', 'SW'];

  const fourUnitBounds = [
    { x: 32, y: 34, w: 230, h: 150 },
    { x: 338, y: 34, w: 230, h: 150 },
    { x: 32, y: 236, w: 230, h: 150 },
    { x: 338, y: 236, w: 230, h: 150 },
  ];

  const threeUnitBounds = [
    { x: 32, y: 34, w: 245, h: 155 },
    { x: 323, y: 34, w: 245, h: 155 },
    { x: 110, y: 236, w: 380, h: 150 },
  ];

  for (let fIdx = 0; fIdx < spec.floorCount; fIdx++) {
    const floorName = FLOOR_NAMES[fIdx] ?? `Floor ${fIdx}`;
    const floorStatuses = spec.statusesByFloor[fIdx] ?? [];
    const flats: FlatUnit[] = [];

    for (let u = 0; u < spec.flatsPerFloor; u++) {
      const flatNum = fIdx === 0 ? `G0${u + 1}` : `${fIdx}0${u + 1}`;
      const bhk = spec.bhkPattern[u % spec.bhkPattern.length];
      const isThreePlus = bhk.startsWith('3') || bhk.startsWith('4');
      const carpet = bhk.startsWith('4') ? 2140 : bhk.includes('Study') ? 1640 : isThreePlus ? 1420 : 1045;
      const builtUp = Math.round(carpet * 1.18);
      const superBuiltUp = Math.round(carpet * 1.34);
      const status: FlatStatus = floorStatuses[u] ?? 'Available';
      const bounds =
        spec.flatsPerFloor === 3
          ? threeUnitBounds[u % threeUnitBounds.length]
          : fourUnitBounds[u % fourUnitBounds.length];

      flats.push({
        id: `${venturePrefix}-flat-${flatNum}`,
        flatNumber: flatNum,
        floorIndex: fIdx,
        floorLabel: floorName,
        bhk,
        carpetAreaSqFt: carpet,
        builtUpAreaSqFt: builtUp,
        superBuiltUpAreaSqFt: superBuiltUp,
        landShareSqYds: spec.landShareBase + (isThreePlus ? 8 : 0),
        facing: facingCycle[u % facingCycle.length],
        balconyDetails: isThreePlus
          ? '2 Covered Balconies (145 sq.ft)'
          : '1 Sit-Out Balcony (95 sq.ft)',
        bedrooms: bhk.startsWith('4') ? 4 : isThreePlus ? 3 : 2,
        bathrooms: bhk.startsWith('4') ? 4 : isThreePlus ? 3 : 2,
        parkingDetails: isThreePlus
          ? `2 Covered Bays (${flatNum}-A, ${flatNum}-B)`
          : `1 Covered Bay (${flatNum}-A)`,
        price: spec.priceMap[bhk] ?? 'Upon Request',
        status,
        svgBounds: bounds,
      });
    }

    floors.push({
      floorIndex: fIdx,
      floorName,
      floorSummary: `${flats.length} flats · Lift & stair core`,
      flats,
    });
  }

  return floors;
}

export const INITIAL_VENTURES: ApartmentVenture[] = [
  {
    id: 'sky-crest-residences',
    name: 'Sky Crest Residences',
    tagline: 'Travertine Boutique Tower · Avenue Frontage',
    location: 'Jubilee Park North, Hyderabad',
    completeAddress: 'Plot 14, Maple Palm Avenue, Jubilee Park North, Hyderabad 500033',
    coordinates: { lat: 17.4326, lng: 78.4071 },
    googleMapsUrl: 'https://maps.google.com/?q=17.4326,78.4071',
    shortDescription: '5 floors · 20 corner 2 BHK & 3 BHK residences with lap pool and landscaped gardens.',
    overviewDescription:
      'Low-density travertine residence accented with deep navy architectural fins, a courtyard lap pool, pergola clubhouse, and shaded perimeter jogging track.',
    constructionStatus: 'Ready to Move',
    mainImageUrl: IMG.skyCrest,
    isPlaceholderDetails: false,
    highlights: [
      '4 corner flats per floor with dual ventilation',
      'Courtyard lap pool & pergola clubhouse',
      'Perimeter jogging track & children’s play park',
      'EV-ready covered stilt parking',
    ],
    buildingInfo: {
      totalLandAreaSqYds: 1120,
      totalBuiltUpAreaSqFt: 33250,
      totalBlocks: 1,
      totalFloors: 5,
      flatsPerFloor: 4,
      configurations: ['2 BHK', '3 BHK'],
      parkingFacilities: '28 Covered Stilt & Basement Bays with EV Charging',
      amenities: [
        'Courtyard Swimming Pool',
        'Pergola Clubhouse Lounge',
        'Perimeter Jogging Track',
        "Children's Play Park",
        'Landscaped Botanical Lawns',
        '24/7 Security & Solar Backup',
      ],
    },
    floors: buildFloors('sky-crest', {
      floorCount: 5,
      flatsPerFloor: 4,
      landShareBase: 52,
      bhkPattern: ['3 BHK', '2 BHK', '2 BHK', '3 BHK'],
      priceMap: {
        '2 BHK': '$265,000',
        '3 BHK': '$368,000',
      },
      statusesByFloor: [
        ['Sold', 'Rented', 'Available', 'Reserved'],
        ['Sold', 'Sold', 'Available', 'Rented'],
        ['Available', 'Sold', 'Reserved', 'Available'],
        ['Sold', 'Rented', 'Available', 'Sold'],
        ['Reserved', 'Available', 'Sold', 'Available'],
      ],
    }),
    directionalViews: buildDirectionalViews('sky-crest', 'Maple Palm Avenue', IMG.skyCrest),
    panoramas: buildPanoramaGraph('sky-crest', 'Sky Crest Residences', 'Maple Palm Avenue'),
    gallery: buildGallery(IMG.skyCrest, 'Sky Crest Residences'),
  },
  {
    id: 'aurelia-heights',
    name: 'Aurelia Heights',
    tagline: 'Sandstone Corner Plaza · Dual Road Access',
    location: 'Banjara Ridge, Hyderabad',
    completeAddress: 'Corner Plot 8B, Ridge Boulevard, Hyderabad 500034',
    coordinates: { lat: 17.4156, lng: 78.4347 },
    googleMapsUrl: 'https://maps.google.com/?q=17.4156,78.4347',
    shortDescription: '4 floors · 16 curved-corner 2 BHK & 3 BHK homes with botanical parkway.',
    overviewDescription:
      'Curved sandstone corner complex featuring botanical-green balustrades, a lagoon courtyard pool, garden clubhouse pavilion, and dedicated basement parking.',
    constructionStatus: 'Finishing Stage',
    mainImageUrl: IMG.aurelia,
    isPlaceholderDetails: false,
    highlights: [
      'Dual-road corner frontage & fountain plaza',
      'Curved corner balconies & acoustic glazing',
      'Lagoon pool deck & indoor gym studio',
      '100% power backup & rainwater harvesting',
    ],
    buildingInfo: {
      totalLandAreaSqYds: 940,
      totalBuiltUpAreaSqFt: 26600,
      totalBlocks: 1,
      totalFloors: 4,
      flatsPerFloor: 4,
      configurations: ['2 BHK', '3 BHK'],
      parkingFacilities: '22 Covered Basement Bays',
      amenities: [
        'Lagoon Swimming Pool',
        'Garden Clubhouse Pavilion',
        'Walking & Jogging Trail',
        'Children’s Play Lawn',
        'Corner Seating Plaza',
        'EV Charger Bay',
      ],
    },
    floors: buildFloors('aurelia', {
      floorCount: 4,
      flatsPerFloor: 4,
      landShareBase: 55,
      bhkPattern: ['2 BHK', '3 BHK', '3 BHK', '2 BHK'],
      priceMap: {
        '2 BHK': '$248,000',
        '3 BHK': '$342,000',
      },
      statusesByFloor: [
        ['Sold', 'Available', 'Rented', 'Available'],
        ['Available', 'Sold', 'Reserved', 'Sold'],
        ['Available', 'Reserved', 'Available', 'Rented'],
        ['Sold', 'Available', 'Available', 'Reserved'],
      ],
    }),
    directionalViews: buildDirectionalViews('aurelia', 'Ridge Boulevard', IMG.aurelia),
    panoramas: buildPanoramaGraph('aurelia', 'Aurelia Heights', 'Ridge Boulevard'),
    gallery: buildGallery(IMG.aurelia, 'Aurelia Heights'),
  },
  {
    id: 'saffron-quarters',
    name: 'Saffron Quarters',
    tagline: 'Stepped Garden Terraces · Courtyard Homes',
    location: 'Gachibowli Greenbelt, Hyderabad',
    completeAddress: 'Survey 42, Cedar Courtyard Road, Gachibowli, Hyderabad 500032',
    coordinates: { lat: 17.4401, lng: 78.3489 },
    googleMapsUrl: 'https://maps.google.com/?q=17.4401,78.3489',
    shortDescription: '5 floors · 15 terraced 3 BHK & Study homes overlooking central botanical lawns.',
    overviewDescription:
      'Stepped terrace architecture with warm cedar soffits, private planted sky-decks, a central courtyard reflection pool, and three expansive residences per floor.',
    constructionStatus: 'Under Construction',
    mainImageUrl: IMG.saffron,
    isPlaceholderDetails: false,
    highlights: [
      '3 expansive residences per floor',
      'Stepped sky-terrace planter decks',
      'Sunken courtyard pool & cedar clubhouse',
      'Dedicated study alcoves & walk-in utility',
    ],
    buildingInfo: {
      totalLandAreaSqYds: 1280,
      totalBuiltUpAreaSqFt: 31800,
      totalBlocks: 1,
      totalFloors: 5,
      flatsPerFloor: 3,
      configurations: ['3 BHK', '3 BHK + Study'],
      parkingFacilities: '30 Covered Stilt Bays',
      amenities: [
        'Sunken Courtyard Pool',
        'Cedar Timber Clubhouse',
        'Central Botanical Lawn',
        'Reflexology Walking Track',
        'Shaded Children’s Play Area',
        'Biometric Access Control',
      ],
    },
    floors: buildFloors('saffron', {
      floorCount: 5,
      flatsPerFloor: 3,
      landShareBase: 76,
      bhkPattern: ['3 BHK', '3 BHK', '3 BHK + Study'],
      priceMap: {
        '3 BHK': '$385,000',
        '3 BHK + Study': '$445,000',
      },
      statusesByFloor: [
        ['Sold', 'Available', 'Reserved'],
        ['Available', 'Sold', 'Available'],
        ['Reserved', 'Available', 'Sold'],
        ['Available', 'Rented', 'Available'],
        ['Available', 'Available', 'Reserved'],
      ],
    }),
    directionalViews: buildDirectionalViews('saffron', 'Cedar Courtyard Road', IMG.saffron),
    panoramas: buildPanoramaGraph('saffron', 'Saffron Quarters', 'Cedar Courtyard Road'),
    gallery: buildGallery(IMG.saffron, 'Saffron Quarters'),
  },
  {
    id: 'blue-bay-terrace',
    name: 'Blue Bay Terrace',
    tagline: 'Six-Story Waterfront Tower · Panoramic Glass',
    location: 'Financial District Lakefront, Hyderabad',
    completeAddress: 'Plot 3, Azure Lakefront Parkway, Hyderabad 500032',
    coordinates: { lat: 17.4198, lng: 78.3422 },
    googleMapsUrl: 'https://maps.google.com/?q=17.4198,78.3422',
    shortDescription: '6 floors · 24 luxury 2 BHK, 3 BHK & 4 BHK Penthouse homes by the waterfront.',
    overviewDescription:
      'Six-story limestone and glass lakefront residence featuring wrap-around sky balconies, a timber waterfront boardwalk, infinity edge pool, and resident sky lounge.',
    constructionStatus: 'New Launch',
    mainImageUrl: IMG.blueBay,
    isPlaceholderDetails: false,
    highlights: [
      'Double-height concierge reception lobby',
      'Wrap-around 270-degree glass balconies',
      'Waterfront boardwalk & infinity edge pool',
      'Top-floor 4 BHK penthouses & twin lifts',
    ],
    buildingInfo: {
      totalLandAreaSqYds: 1540,
      totalBuiltUpAreaSqFt: 48600,
      totalBlocks: 1,
      totalFloors: 6,
      flatsPerFloor: 4,
      configurations: ['2 BHK', '3 BHK', '4 BHK Penthouse'],
      parkingFacilities: '44 Dual-Level Basement Bays',
      amenities: [
        'Infinity Edge Waterfront Pool',
        'Lakefront Timber Boardwalk',
        'Sky Clubhouse & Lounge',
        'Waterfront Jogging Promenade',
        'Sculpture Garden & Play Zone',
        'Concierge & Twin Elevators',
      ],
    },
    floors: buildFloors('blue-bay', {
      floorCount: 6,
      flatsPerFloor: 4,
      landShareBase: 58,
      bhkPattern: ['2 BHK', '3 BHK', '3 BHK', '4 BHK Penthouse'],
      priceMap: {
        '2 BHK': '$295,000',
        '3 BHK': '$415,000',
        '4 BHK Penthouse': '$625,000',
      },
      statusesByFloor: [
        ['Reserved', 'Available', 'Sold', 'Available'],
        ['Sold', 'Available', 'Available', 'Reserved'],
        ['Available', 'Rented', 'Available', 'Sold'],
        ['Available', 'Available', 'Reserved', 'Available'],
        ['Sold', 'Available', 'Available', 'Available'],
        ['Available', 'Reserved', 'Available', 'Sold'],
      ],
    }),
    directionalViews: buildDirectionalViews('blue-bay', 'Azure Lakefront Parkway', IMG.blueBay),
    panoramas: buildPanoramaGraph('blue-bay', 'Blue Bay Terrace', 'Azure Lakefront Parkway'),
    gallery: buildGallery(IMG.blueBay, 'Blue Bay Terrace'),
  },
];

export const HERO_BANNER_IMAGE = IMG.hero;
export const SUITE_PREVIEW_IMAGE = IMG.suite;
