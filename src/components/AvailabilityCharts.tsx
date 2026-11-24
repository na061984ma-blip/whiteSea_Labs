import React from 'react';
import type { VentureStats } from '../types/realEstate';

interface AvailabilityChartsProps {
  stats: VentureStats;
  projectName: string;
}

export const AvailabilityCharts: React.FC<AvailabilityChartsProps> = ({ stats }) => {
  const segments = [
    {
      label: 'Available',
      count: stats.availableFlats,
      pct: stats.availablePct,
      color: '#16A34A',
      cardBg: 'bg-emerald-50/70',
      border: 'border-emerald-700/25',
      text: 'text-emerald-900',
    },
    {
      label: 'Sold',
      count: stats.soldFlats,
      pct: stats.soldPct,
      color: '#DC2626',
      cardBg: 'bg-red-50/70',
      border: 'border-red-700/25',
      text: 'text-red-900',
    },
    {
      label: 'Rented',
      count: stats.rentedFlats,
      pct: stats.rentedPct,
      color: '#2563EB',
      cardBg: 'bg-blue-50/70',
      border: 'border-blue-700/25',
      text: 'text-blue-900',
    },
    {
      label: 'Reserved',
      count: stats.reservedFlats,
      pct: stats.reservedPct,
      color: '#D97706',
      cardBg: 'bg-amber-50/70',
      border: 'border-amber-700/25',
      text: 'text-amber-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="p-5 rounded-xl bg-[#141E2B] text-[#FAF8F4] border border-[#243244]">
        <p className="text-xs font-medium text-[#B89452]">Total Flats</p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums">{stats.totalFlats}</p>
        <p className="mt-1 text-xs text-[#FAF8F4]/70">100.0% Inventory</p>
      </div>

      {segments.map((seg) => (
        <div
          key={seg.label}
          className={`p-5 rounded-xl border ${seg.cardBg} ${seg.border} ${seg.text}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{seg.label} Flats</p>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums">{seg.count}</p>
          <p className="mt-1 text-xs font-mono tabular-nums opacity-80">
            {seg.pct.toFixed(1)}% of total
          </p>
        </div>
      ))}
    </div>
  );
};
