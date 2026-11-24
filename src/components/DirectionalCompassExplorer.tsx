import React, { useState } from 'react';
import { Compass, Eye, MapPin } from 'lucide-react';
import type { DirectionCode, DirectionalView } from '../types/realEstate';
import { DIRECTION_ORDER } from '../utils/ventureStats';
import { SafeImage } from './SafeImage';

interface DirectionalCompassExplorerProps {
  views: DirectionalView[];
  projectName: string;
  onExploreIn360: (
    panoramaNodeId: string,
    bearingDegrees: number,
    direction?: DirectionCode,
  ) => void;
}

const COMPASS_COORDS: Record<DirectionCode, { x: number; y: number }> = {
  N: { x: 140, y: 26 },
  NE: { x: 221, y: 59 },
  E: { x: 254, y: 140 },
  SE: { x: 221, y: 221 },
  S: { x: 140, y: 254 },
  SW: { x: 59, y: 221 },
  W: { x: 26, y: 140 },
  NW: { x: 59, y: 59 },
};

export const DirectionalCompassExplorer: React.FC<DirectionalCompassExplorerProps> = ({
  views,
  projectName,
  onExploreIn360,
}) => {
  const [selectedDir, setSelectedDir] = useState<DirectionCode>('N');
  const activeView = views.find((v) => v.direction === selectedDir) ?? views[0];

  if (!activeView) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2DDD3]">
        <div>
          <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
            8-Direction Site &amp; Building Orientation
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[#141E2B]">
            Directional Property Exploration
          </h3>
          <p className="mt-1 text-sm text-[#1D2939]/75">
            Select any compass bearing to inspect site notes and move the 3D exterior camera around the property.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#1D2939]/70 tabular-nums">
          <Compass className="w-4 h-4 text-[#B89452]" />
          <span>Active Bearing: {activeView.direction} ({activeView.bearingDegrees}°)</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive SVG Compass Rose */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]">
            <svg viewBox="0 0 280 280" className="w-full h-full">
              <circle cx="140" cy="140" r="126" fill="#FAF8F4" stroke="#E2DDD3" strokeWidth="1.5" />
              <circle cx="140" cy="140" r="94" fill="none" stroke="#E2DDD3" strokeDasharray="4 4" strokeWidth="1" />
              <circle cx="140" cy="140" r="46" fill="#141E2B" />

              <line x1="140" y1="40" x2="140" y2="240" stroke="#E2DDD3" strokeWidth="1" />
              <line x1="40" y1="140" x2="240" y2="140" stroke="#E2DDD3" strokeWidth="1" />
              <line x1="68" y1="68" x2="212" y2="212" stroke="#E2DDD3" strokeWidth="1" />
              <line x1="212" y1="68" x2="68" y2="212" stroke="#E2DDD3" strokeWidth="1" />

              <line
                x1="140"
                y1="140"
                x2={COMPASS_COORDS[activeView.direction].x}
                y2={COMPASS_COORDS[activeView.direction].y}
                stroke="#B89452"
                strokeWidth="3"
              />

              <text
                x="140"
                y="137"
                textAnchor="middle"
                fill="#B89452"
                fontSize="12"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {activeView.direction}
              </text>
              <text
                x="140"
                y="153"
                textAnchor="middle"
                fill="#FAF8F4"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {activeView.bearingDegrees}°
              </text>
            </svg>

            {DIRECTION_ORDER.map((dir) => {
              const pos = COMPASS_COORDS[dir];
              const isSelected = dir === activeView.direction;
              const leftPct = (pos.x / 280) * 100;
              const topPct = (pos.y / 280) * 100;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setSelectedDir(dir)}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#B89452] text-[#141E2B] border-[#141E2B] shadow-md scale-110'
                      : 'bg-white text-[#141E2B] border-[#E2DDD3] hover:border-[#B89452] hover:bg-[#FAF8F4]'
                  }`}
                >
                  {dir}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2 w-full max-w-xs">
            {DIRECTION_ORDER.map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setSelectedDir(dir)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  dir === activeView.direction
                    ? 'bg-[#141E2B] text-[#FAF8F4] border-[#141E2B]'
                    : 'bg-[#FAF8F4] text-[#1D2939] border-[#E2DDD3] hover:border-[#B89452]'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Direction View Card */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden border border-[#E2DDD3]">
            <SafeImage
              src={activeView.previewImageUrl}
              alt={`${projectName} — ${activeView.label}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141E2B]/85 via-[#141E2B]/25 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-[#FAF8F4] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs font-mono text-[#B89452]">
                  Bearing {activeView.bearingDegrees}° · {activeView.direction}
                </p>
                <h4 className="font-display text-xl font-bold">{activeView.label}</h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  onExploreIn360(
                    activeView.panoramaNodeId,
                    activeView.bearingDegrees,
                    activeView.direction,
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Explore {activeView.direction} in 360°</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-2.5">
            <p className="text-sm text-[#1D2939] leading-relaxed">{activeView.description}</p>
            <div className="flex items-start gap-2 pt-2 border-t border-[#E2DDD3] text-xs text-[#4A6B53] font-medium">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{activeView.verifiedSiteNote}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
