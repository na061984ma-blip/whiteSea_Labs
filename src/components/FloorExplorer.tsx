import React, { useState } from 'react';
import {
  Bath,
  BedDouble,
  Car,
  Compass,
  Expand,
  Home,
  Layers,
  MessageSquare,
  X,
} from 'lucide-react';
import type { FlatStatus, FlatUnit, FloorPlan } from '../types/realEstate';
import { STATUS_COLORS } from '../utils/ventureStats';

interface FloorExplorerProps {
  floors: FloorPlan[];
  projectName: string;
  selectedFloorIndex: number;
  onSelectFloor: (idx: number) => void;
  onContactForFlat: (flat: FlatUnit) => void;
  onLaunch360Interior?: (floorIndex: number, flatId: string) => void;
}

const ALL_STATUSES: FlatStatus[] = ['Available', 'Sold', 'Rented', 'Reserved'];

export const FloorExplorer: React.FC<FloorExplorerProps> = ({
  floors,
  projectName,
  selectedFloorIndex,
  onSelectFloor,
  onContactForFlat,
  onLaunch360Interior,
}) => {
  const [selectedFlat, setSelectedFlat] = useState<FlatUnit | null>(null);
  const [showExpandedSpecs, setShowExpandedSpecs] = useState(false);

  const activeFloor = floors.find((f) => f.floorIndex === selectedFloorIndex) ?? floors[0];

  if (!activeFloor) return null;

  const openFlatModal = (flat: FlatUnit) => {
    setSelectedFlat(flat);
    setShowExpandedSpecs(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 lg:p-8 space-y-6">
      {/* Header + Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2DDD3]">
        <div>
          <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
            Floor Plans &amp; Apartment Configurations
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[#141E2B]">
            Interactive Floor-by-Floor Explorer
          </h3>
          <p className="mt-1 text-sm text-[#1D2939]/75">
            Select a floor level to inspect its layout, flat numbers, and configurations, or step directly inside any flat in 3D 360°.
          </p>
        </div>

        {/* Color-Coded Status Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {ALL_STATUSES.map((status) => (
            <div
              key={status}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].border} ${STATUS_COLORS[status].text}`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status].swatch }}
              />
              <span>{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floor Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {floors.map((floor) => {
          const isSelected = floor.floorIndex === activeFloor.floorIndex;
          const availCount = floor.flats.filter((f) => f.status === 'Available').length;
          return (
            <button
              key={floor.floorIndex}
              type="button"
              onClick={() => onSelectFloor(floor.floorIndex)}
              className={`px-4 py-2.5 rounded-xl border text-left transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#141E2B] text-[#FAF8F4] border-[#141E2B]'
                  : 'bg-[#FAF8F4] text-[#1D2939] border-[#E2DDD3] hover:border-[#B89452]'
              }`}
            >
              <div className="text-xs font-semibold">{floor.floorName}</div>
              <div
                className={`text-[11px] font-mono tabular-nums mt-0.5 ${
                  isSelected ? 'text-[#B89452]' : 'text-[#1D2939]/65'
                }`}
              >
                {floor.flats.length} Flats · {availCount} Available
              </div>
            </button>
          );
        })}
      </div>

      {/* Floor Plan Interactive Map + Flat Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 bg-[#FAF8F4] rounded-xl border border-[#E2DDD3] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="font-display text-base font-bold text-[#141E2B]">
                {projectName} — {activeFloor.floorName} Plan
              </h4>
              <p className="text-xs text-[#1D2939]/70">{activeFloor.floorSummary}</p>
            </div>
            <span className="text-xs font-mono text-[#4A6B53] font-medium">
              Click any unit to inspect
            </span>
          </div>

          {activeFloor.blueprintImageUrl ? (
            <div className="relative rounded-lg overflow-hidden border border-[#E2DDD3] mb-4">
              <img
                src={activeFloor.blueprintImageUrl}
                alt={`${projectName} ${activeFloor.floorName} uploaded blueprint`}
                className="w-full max-h-96 object-contain bg-white"
              />
            </div>
          ) : null}

          <div className="w-full overflow-hidden rounded-lg border border-[#E2DDD3] bg-white p-2">
            <svg
              viewBox="0 0 600 420"
              className="w-full h-auto"
              role="img"
              aria-label={`${activeFloor.floorName} architectural layout with clickable flats`}
            >
              <rect
                x="14"
                y="14"
                width="572"
                height="392"
                rx="10"
                fill="#FAF8F4"
                stroke="#141E2B"
                strokeWidth="2"
              />

              <rect
                x="266"
                y="188"
                width="68"
                height="44"
                rx="4"
                fill="#141E2B"
              />
              <text
                x="300"
                y="207"
                textAnchor="middle"
                fill="#FAF8F4"
                fontSize="9"
                fontWeight="600"
              >
                LIFT &amp;
              </text>
              <text
                x="300"
                y="219"
                textAnchor="middle"
                fill="#B89452"
                fontSize="9"
                fontWeight="600"
              >
                STAIR CORE
              </text>

              <rect x="32" y="198" width="234" height="24" fill="#E2DDD3" opacity="0.6" />
              <rect x="334" y="198" width="234" height="24" fill="#E2DDD3" opacity="0.6" />
              <text
                x="148"
                y="213"
                textAnchor="middle"
                fill="#1D2939"
                fontSize="9"
                opacity="0.7"
              >
                WEST CORRIDOR LOBBY
              </text>
              <text
                x="452"
                y="213"
                textAnchor="middle"
                fill="#1D2939"
                fontSize="9"
                opacity="0.7"
              >
                EAST CORRIDOR LOBBY
              </text>

              <g transform="translate(300, 26)">
                <circle r="10" fill="#141E2B" />
                <text y="3.5" textAnchor="middle" fill="#B89452" fontSize="9" fontWeight="700">
                  N
                </text>
              </g>

              {activeFloor.flats.map((flat) => {
                const palette = STATUS_COLORS[flat.status];
                const { x, y, w, h } = flat.svgBounds;
                const isSelected = selectedFlat?.id === flat.id;
                return (
                  <g
                    key={flat.id}
                    onClick={() => openFlatModal(flat)}
                    className="cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFlatModal(flat);
                      }
                    }}
                    aria-label={`Flat ${flat.flatNumber}, ${flat.bhk}, ${flat.status}`}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx="8"
                      fill={palette.fillHex}
                      stroke={isSelected ? '#141E2B' : palette.strokeHex}
                      strokeWidth={isSelected ? 3 : 1.75}
                    />
                    <line
                      x1={x + w * 0.52}
                      y1={y + 12}
                      x2={x + w * 0.52}
                      y2={y + h - 12}
                      stroke={palette.strokeHex}
                      strokeOpacity="0.22"
                      strokeDasharray="3 3"
                    />
                    <line
                      x1={x + 12}
                      y1={y + h * 0.58}
                      x2={x + w - 12}
                      y2={y + h * 0.58}
                      stroke={palette.strokeHex}
                      strokeOpacity="0.22"
                      strokeDasharray="3 3"
                    />

                    <text
                      x={x + 16}
                      y={y + 30}
                      fill="#1D2939"
                      fontSize="16"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      Flat {flat.flatNumber}
                    </text>

                    <text
                      x={x + 16}
                      y={y + 50}
                      fill="#1D2939"
                      fontSize="11.5"
                      fontWeight="600"
                      opacity="0.82"
                    >
                      {flat.bhk} · Facing {flat.facing}
                    </text>

                    <text
                      x={x + 16}
                      y={y + 70}
                      fill="#1D2939"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      opacity="0.75"
                    >
                      {flat.superBuiltUpAreaSqFt.toLocaleString()} sq.ft SBA
                    </text>

                    <rect
                      x={x + 16}
                      y={y + h - 38}
                      width={86}
                      height={22}
                      rx="5"
                      fill={palette.swatch}
                    />
                    <text
                      x={x + 59}
                      y={y + h - 23}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="10.5"
                      fontWeight="700"
                    >
                      {flat.status}
                    </text>

                    <text
                      x={x + w - 14}
                      y={y + h - 23}
                      textAnchor="end"
                      fill="#141E2B"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {flat.price}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Clickable Flat Summary List */}
        <div className="xl:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-bold text-[#141E2B]">
              {activeFloor.floorName} Units ({activeFloor.flats.length})
            </h4>
            <span className="text-xs text-[#1D2939]/65">Tap unit to inspect or walk in 3D</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
            {activeFloor.flats.map((flat) => {
              const palette = STATUS_COLORS[flat.status];
              return (
                <div
                  key={flat.id}
                  onClick={() => openFlatModal(flat)}
                  className="w-full text-left p-4 rounded-xl border border-[#E2DDD3] bg-[#FAF8F4] hover:border-[#B89452] transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-bold text-[#141E2B]">
                        Flat {flat.flatNumber}
                      </span>
                      <span className="text-xs text-[#1D2939]/70">· {flat.bhk}</span>
                    </div>
                    <div className="mt-1 text-xs text-[#1D2939]/75 font-mono tabular-nums">
                      Carpet {flat.carpetAreaSqFt.toLocaleString()} sq.ft · Facing {flat.facing}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-[#141E2B]">{flat.price}</div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${palette.bg} ${palette.border} ${palette.text}`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: palette.swatch }}
                      />
                      {flat.status}
                    </span>
                    {onLaunch360Interior && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunch360Interior(flat.floorIndex, flat.id);
                        }}
                        className="text-[11px] font-semibold text-[#4A6B53] hover:text-[#141E2B] cursor-pointer"
                      >
                        Enter Flat in 360° →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Flat Details Modal */}
      {selectedFlat && (
        <div
          className="fixed inset-0 z-50 bg-[#141E2B]/75 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="flat-detail-title"
        >
          <div className="bg-[#FAF8F4] w-full max-w-2xl rounded-2xl border border-[#E2DDD3] shadow-2xl overflow-hidden my-auto">
            <div className="bg-[#141E2B] text-[#FAF8F4] px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#B89452]">
                  {projectName} · {selectedFlat.floorLabel}
                </p>
                <h4 id="flat-detail-title" className="font-display text-2xl font-bold mt-0.5">
                  Flat {selectedFlat.flatNumber} — {selectedFlat.bhk}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFlat(null)}
                className="p-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] transition-colors cursor-pointer"
                aria-label="Close flat details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E2DDD3]">
                <div>
                  <span className="text-xs text-[#1D2939]/65">Listed Price</span>
                  <div className="font-display text-2xl font-bold text-[#141E2B] tabular-nums">
                    {selectedFlat.price}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${STATUS_COLORS[selectedFlat.status].bg} ${STATUS_COLORS[selectedFlat.status].border} ${STATUS_COLORS[selectedFlat.status].text}`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[selectedFlat.status].swatch }}
                    />
                    Status: {selectedFlat.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <Layers className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <span>Carpet Area</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-[#141E2B] tabular-nums">
                    {selectedFlat.carpetAreaSqFt.toLocaleString()} sq.ft
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <Home className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <span>Built-Up Area</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-[#141E2B] tabular-nums">
                    {selectedFlat.builtUpAreaSqFt.toLocaleString()} sq.ft
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <Expand className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <span>Super Built-Up</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-[#141E2B] tabular-nums">
                    {selectedFlat.superBuiltUpAreaSqFt.toLocaleString()} sq.ft
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <span>Undivided Land Share</span>
                  </div>
                  <div className="mt-1 font-mono text-base font-bold text-[#141E2B] tabular-nums">
                    {selectedFlat.landShareSqYds} sq.yds
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <Compass className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <span>Facing Direction</span>
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-[#141E2B]">
                    {selectedFlat.facing} Facing
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD3]">
                  <div className="flex items-center gap-1.5 text-xs text-[#1D2939]/65">
                    <BedDouble className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <Bath className="w-3.5 h-3.5 text-[#4A6B53]" />
                    <span>Rooms</span>
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-[#141E2B]">
                    {selectedFlat.bedrooms} Beds · {selectedFlat.bathrooms} Baths
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2DDD3] space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#1D2939]/70 font-medium">Balcony Details</span>
                  <span className="text-right font-medium text-[#141E2B]">
                    {selectedFlat.balconyDetails}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-[#E2DDD3] flex items-start justify-between gap-4">
                  <span className="text-[#1D2939]/70 font-medium flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#B89452]" />
                    Parking Allocation
                  </span>
                  <span className="text-right font-medium text-[#141E2B]">
                    {selectedFlat.parkingDetails}
                  </span>
                </div>
              </div>

              {showExpandedSpecs && (
                <div className="p-4 rounded-xl bg-[#F3EFE8] border border-[#E2DDD3] space-y-2 text-xs text-[#1D2939]/85 leading-relaxed">
                  <p className="font-semibold text-[#141E2B]">
                    Architectural &amp; Finish Schedule — Flat {selectedFlat.flatNumber}
                  </p>
                  <p>
                    • Floor Level: {selectedFlat.floorLabel} (Level Index {selectedFlat.floorIndex})
                  </p>
                  <p>
                    • Structural Efficiency Ratio:{' '}
                    {Math.round(
                      (selectedFlat.carpetAreaSqFt / selectedFlat.superBuiltUpAreaSqFt) * 100,
                    )}
                    % net carpet-to-super-built-up efficiency
                  </p>
                  <p>
                    • Acoustic double-glazed windows on {selectedFlat.facing} facade, engineered oak &amp; honed limestone flooring, concealed VRV air-conditioning conduit, and open travertine kitchen prep.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                {onLaunch360Interior && (
                  <button
                    type="button"
                    onClick={() => {
                      const flIdx = selectedFlat.floorIndex;
                      const flId = selectedFlat.id;
                      setSelectedFlat(null);
                      onLaunch360Interior(flIdx, flId);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#B89452]" />
                    <span>Explore in 360°</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowExpandedSpecs((prev) => !prev)}
                  className="px-5 py-2.5 rounded-lg border border-[#141E2B] text-[#141E2B] hover:bg-[#F3EFE8] text-sm font-medium transition-colors cursor-pointer"
                >
                  {showExpandedSpecs ? 'Hide Full Details' : 'View Details'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const flat = selectedFlat;
                    setSelectedFlat(null);
                    onContactForFlat(flat);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] text-sm font-bold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact for Enquiry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
