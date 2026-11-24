export type FlatStatus = 'Available' | 'Sold' | 'Rented' | 'Reserved';

export type DirectionCode = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type GalleryCategory =
  | 'Building Exterior'
  | 'Building Interior'
  | 'Entrance'
  | 'Living Room'
  | 'Bedrooms'
  | 'Kitchen'
  | 'Bathrooms'
  | 'Balconies'
  | 'Parking'
  | 'Amenities'
  | 'Surrounding Roads';

export interface SvgBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FlatUnit {
  id: string;
  flatNumber: string;
  floorIndex: number;
  floorLabel: string;
  bhk: string;
  carpetAreaSqFt: number;
  builtUpAreaSqFt: number;
  superBuiltUpAreaSqFt: number;
  landShareSqYds: number;
  facing: DirectionCode;
  balconyDetails: string;
  bedrooms: number;
  bathrooms: number;
  parkingDetails: string;
  price: string;
  status: FlatStatus;
  svgBounds: SvgBounds;
}

export interface FloorPlan {
  floorIndex: number;
  floorName: string;
  floorSummary: string;
  blueprintImageUrl?: string;
  flats: FlatUnit[];
}

export interface DirectionalView {
  direction: DirectionCode;
  label: string;
  bearingDegrees: number;
  description: string;
  panoramaNodeId: string;
  previewImageUrl: string;
  verifiedSiteNote: string;
}

export interface PanoramaHotspot {
  id: string;
  yaw: number;
  pitch: number;
  title: string;
  detail: string;
  targetNodeId?: string;
  targetFloorIndex?: number;
  flatId?: string;
}

export interface RoadConnections {
  forwardNodeId?: string;
  forwardLabel?: string;
  backwardNodeId?: string;
  backwardLabel?: string;
  leftNodeId?: string;
  leftLabel?: string;
  rightNodeId?: string;
  rightLabel?: string;
}

export interface PanoramaNode {
  id: string;
  title: string;
  category: 'road' | 'exterior' | 'interior' | 'amenity';
  zone?: 'exterior' | 'interior';
  exteriorSide?: 'front' | 'back' | 'left' | 'right';
  mediaType: 'image' | 'video';
  mediaUrl: string;
  isPlaceholderMedia: boolean;
  floorIndex?: number;
  defaultYaw: number;
  compassHeadingLabel: string;
  description: string;
  connections: RoadConnections;
  hotspots: PanoramaHotspot[];
}

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  title: string;
  caption: string;
  imageUrl: string;
  isPlaceholder?: boolean;
}

export interface BuildingInfo {
  totalLandAreaSqYds: number;
  totalBuiltUpAreaSqFt: number;
  totalBlocks: number;
  totalFloors: number;
  flatsPerFloor: number;
  configurations: string[];
  parkingFacilities: string;
  amenities: string[];
}

export type ConstructionStatus =
  | 'Ready to Move'
  | 'Finishing Stage'
  | 'Under Construction'
  | 'New Launch';

export interface ApartmentVenture {
  id: string;
  name: string;
  tagline: string;
  location: string;
  completeAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  shortDescription: string;
  overviewDescription: string;
  constructionStatus: ConstructionStatus;
  mainImageUrl: string;
  isPlaceholderDetails: boolean;
  highlights: string[];
  buildingInfo: BuildingInfo;
  floors: FloorPlan[];
  directionalViews: DirectionalView[];
  panoramas: PanoramaNode[];
  gallery: GalleryItem[];
}

export interface VentureStats {
  totalFlats: number;
  availableFlats: number;
  soldFlats: number;
  rentedFlats: number;
  reservedFlats: number;
  availablePct: number;
  soldPct: number;
  rentedPct: number;
  reservedPct: number;
}

export interface PropertyEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  ventureId?: string;
  ventureName?: string;
  flatNumber?: string;
  message: string;
  createdAt: string;
}

export type AppPage = 'home' | 'ventures' | 'projects' | 'venture-detail' | 'admin';
