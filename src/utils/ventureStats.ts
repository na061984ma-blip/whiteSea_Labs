import type { ApartmentVenture, DirectionCode, FlatStatus, VentureStats } from '../types/realEstate';

export function computeVentureStats(venture: ApartmentVenture): VentureStats {
  const allFlats = venture.floors.flatMap((floor) => floor.flats);
  const totalFlats = allFlats.length;

  let availableFlats = 0;
  let soldFlats = 0;
  let rentedFlats = 0;
  let reservedFlats = 0;

  for (const flat of allFlats) {
    if (flat.status === 'Available') availableFlats += 1;
    else if (flat.status === 'Sold') soldFlats += 1;
    else if (flat.status === 'Rented') rentedFlats += 1;
    else if (flat.status === 'Reserved') reservedFlats += 1;
  }

  const pct = (count: number) =>
    totalFlats === 0 ? 0 : Math.round((count / totalFlats) * 1000) / 10;

  return {
    totalFlats,
    availableFlats,
    soldFlats,
    rentedFlats,
    reservedFlats,
    availablePct: pct(availableFlats),
    soldPct: pct(soldFlats),
    rentedPct: pct(rentedFlats),
    reservedPct: pct(reservedFlats),
  };
}

export function computePortfolioStats(ventures: ApartmentVenture[]): VentureStats {
  const combinedFlats = ventures.flatMap((v) => v.floors.flatMap((f) => f.flats));
  const totalFlats = combinedFlats.length;

  const availableFlats = combinedFlats.filter((f) => f.status === 'Available').length;
  const soldFlats = combinedFlats.filter((f) => f.status === 'Sold').length;
  const rentedFlats = combinedFlats.filter((f) => f.status === 'Rented').length;
  const reservedFlats = combinedFlats.filter((f) => f.status === 'Reserved').length;

  const pct = (count: number) =>
    totalFlats === 0 ? 0 : Math.round((count / totalFlats) * 1000) / 10;

  return {
    totalFlats,
    availableFlats,
    soldFlats,
    rentedFlats,
    reservedFlats,
    availablePct: pct(availableFlats),
    soldPct: pct(soldFlats),
    rentedPct: pct(rentedFlats),
    reservedPct: pct(reservedFlats),
  };
}

export const STATUS_COLORS: Record<
  FlatStatus,
  {
    bg: string;
    border: string;
    text: string;
    fillHex: string;
    strokeHex: string;
    swatch: string;
  }
> = {
  Available: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-600/40',
    text: 'text-emerald-800',
    fillHex: '#DCFCE7',
    strokeHex: '#15803D',
    swatch: '#16A34A',
  },
  Sold: {
    bg: 'bg-red-50',
    border: 'border-red-600/40',
    text: 'text-red-800',
    fillHex: '#FEE2E2',
    strokeHex: '#B91C1C',
    swatch: '#DC2626',
  },
  Rented: {
    bg: 'bg-blue-50',
    border: 'border-blue-600/40',
    text: 'text-blue-800',
    fillHex: '#DBEAFE',
    strokeHex: '#1D4ED8',
    swatch: '#2563EB',
  },
  Reserved: {
    bg: 'bg-amber-50',
    border: 'border-amber-600/40',
    text: 'text-amber-800',
    fillHex: '#FEF3C7',
    strokeHex: '#B45309',
    swatch: '#D97706',
  },
};

export const DIRECTION_ORDER: DirectionCode[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function yawToDirection(yawDeg: number): { code: DirectionCode; label: string; normalizedDeg: number } {
  const normalized = ((yawDeg % 360) + 360) % 360;
  const sectors: { code: DirectionCode; label: string }[] = [
    { code: 'N', label: 'North' },
    { code: 'NE', label: 'North-East' },
    { code: 'E', label: 'East' },
    { code: 'SE', label: 'South-East' },
    { code: 'S', label: 'South' },
    { code: 'SW', label: 'South-West' },
    { code: 'W', label: 'West' },
    { code: 'NW', label: 'North-West' },
  ];
  const index = Math.round(normalized / 45) % 8;
  return {
    ...sectors[index],
    normalizedDeg: Math.round(normalized),
  };
}

export function validateVentureIntegrity(venture: ApartmentVenture): string[] {
  const errors: string[] = [];

  if (!venture.name.trim()) errors.push('Project name is required.');
  if (!venture.location.trim()) errors.push('Location is required.');
  if (venture.buildingInfo.totalLandAreaSqYds <= 0) {
    errors.push('Total land area (sq. yds) must be greater than zero.');
  }
  if (venture.buildingInfo.totalBuiltUpAreaSqFt <= 0) {
    errors.push('Total built-up area (sq. ft) must be greater than zero.');
  }
  if (venture.floors.length === 0) {
    errors.push('At least one floor must be configured.');
  }

  const seenFlatNumbers = new Set<string>();
  for (const floor of venture.floors) {
    for (const flat of floor.flats) {
      const key = `${floor.floorIndex}:${flat.flatNumber.trim().toLowerCase()}`;
      if (!flat.flatNumber.trim()) {
        errors.push(`Floor "${floor.floorName}" contains a flat with an empty flat number.`);
      } else if (seenFlatNumbers.has(key)) {
        errors.push(`Duplicate flat number "${flat.flatNumber}" on ${floor.floorName}.`);
      }
      seenFlatNumbers.add(key);

      if (flat.carpetAreaSqFt <= 0 || flat.builtUpAreaSqFt <= 0 || flat.superBuiltUpAreaSqFt <= 0) {
        errors.push(`Flat ${flat.flatNumber} has invalid square-footage area values.`);
      }
      if (flat.carpetAreaSqFt > flat.superBuiltUpAreaSqFt) {
        errors.push(
          `Flat ${flat.flatNumber}: Carpet area (${flat.carpetAreaSqFt}) cannot exceed Super Built-up area (${flat.superBuiltUpAreaSqFt}).`,
        );
      }
    }
  }

  return errors;
}
