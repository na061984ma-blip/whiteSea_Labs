import React from 'react';
import { ArrowRight, Compass, Layers } from 'lucide-react';
import type { ApartmentVenture, AppPage } from '../types/realEstate';
import { computeVentureStats } from '../utils/ventureStats';

interface ProjectsComparePageProps {
  ventures: ApartmentVenture[];
  onSelectVenture: (ventureId: string, focus360?: boolean) => void;
  onNavigate: (page: AppPage) => void;
}

export const ProjectsComparePage: React.FC<ProjectsComparePageProps> = ({
  ventures,
  onSelectVenture,
  onNavigate,
}) => {
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2DDD3]">
          <div>
            <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
              Side-by-Side Specifications
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-[#141E2B]">
              Projects Matrix &amp; Availability Ledger
            </h1>
            <p className="mt-2 text-sm text-[#1D2939]/75 max-w-2xl">
              Compare land parcels, built-up areas, floor counts, configurations, and real-time flat availability across all active Meridian Estates developments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('ventures')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open Ventures Grid</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-[#E2DDD3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-[#141E2B] text-[#FAF8F4] text-xs font-semibold">
                  <th className="py-4 px-5">Project &amp; Location</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Land (sq.yds)</th>
                  <th className="py-4 px-4 text-right">Built-Up (sq.ft)</th>
                  <th className="py-4 px-4 text-right">Floors</th>
                  <th className="py-4 px-4">Configurations</th>
                  <th className="py-4 px-4 text-right">Total</th>
                  <th className="py-4 px-4 text-right">Available</th>
                  <th className="py-4 px-4 text-right">Sold</th>
                  <th className="py-4 px-4 text-right">Rented</th>
                  <th className="py-4 px-5 text-right">3D Walkthrough</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DDD3] text-sm">
                {ventures.map((v) => {
                  const stats = computeVentureStats(v);
                  return (
                    <tr key={v.id} className="hover:bg-[#FAF8F4] transition-colors">
                      <td className="py-4 px-5">
                        <button
                          type="button"
                          onClick={() => onSelectVenture(v.id, false)}
                          className="font-display font-bold text-[#141E2B] hover:text-[#4A6B53] text-left cursor-pointer"
                        >
                          {v.name}
                        </button>
                        <div className="text-xs text-[#1D2939]/65 mt-0.5">{v.location}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-[#4A6B53]">
                        {v.constructionStatus}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums text-xs">
                        {v.buildingInfo.totalLandAreaSqYds.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums text-xs">
                        {v.buildingInfo.totalBuiltUpAreaSqFt.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums text-xs">
                        {v.floors.length}
                      </td>
                      <td className="py-4 px-4 text-xs text-[#1D2939]/80">
                        {v.buildingInfo.configurations.join(', ')}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-bold text-[#141E2B]">
                        {stats.totalFlats}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {stats.availableFlats}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-bold text-red-700">
                        {stats.soldFlats}
                      </td>
                      <td className="py-4 px-4 text-right font-mono tabular-nums font-bold text-blue-700">
                        {stats.rentedFlats}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectVenture(v.id, true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>Explore in 360°</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#B89452]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Highlights Callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E2DDD3] flex items-start gap-4">
            <Compass className="w-6 h-6 text-[#B89452] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-base font-bold text-[#141E2B]">
                8-Direction Orientation Verification
              </h3>
              <p className="mt-1 text-xs text-[#1D2939]/75 leading-relaxed">
                Every residence page includes an interactive 8-point compass rose synced directly to the 3D exterior camera orientation.
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-[#E2DDD3] flex items-start gap-4">
            <Layers className="w-6 h-6 text-[#4A6B53] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-base font-bold text-[#141E2B]">
                Dynamically Synced Inventory
              </h3>
              <p className="mt-1 text-xs text-[#1D2939]/75 leading-relaxed">
                All flat counts, occupancy percentages, and unit statuses in this ledger are calculated live from each building&rsquo;s floor plan records.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
