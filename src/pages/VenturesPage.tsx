import React, { useState } from 'react';
import { Building2, Compass, MapPin, Settings } from 'lucide-react';
import type { ApartmentVenture, AppPage, ConstructionStatus } from '../types/realEstate';
import { computePortfolioStats, computeVentureStats } from '../utils/ventureStats';
import { SafeImage } from '../components/SafeImage';

interface VenturesPageProps {
  ventures: ApartmentVenture[];
  onSelectVenture: (ventureId: string, focus360?: boolean) => void;
  onNavigate: (page: AppPage) => void;
}

const STATUS_FILTERS: Array<'All' | ConstructionStatus> = [
  'All',
  'Ready to Move',
  'Finishing Stage',
  'Under Construction',
  'New Launch',
];

export const VenturesPage: React.FC<VenturesPageProps> = ({
  ventures,
  onSelectVenture,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | ConstructionStatus>('All');
  const portfolio = computePortfolioStats(ventures);

  const visibleVentures =
    statusFilter === 'All'
      ? ventures
      : ventures.filter((v) => v.constructionStatus === statusFilter);

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-14">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E2DDD3]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
              Residential Ventures
            </p>
            <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-[#141E2B]">
              Apartment Communities
            </h1>
            <p className="mt-2 text-sm text-[#1D2939]/75">
              Four distinct residential designs with live floor-wise availability, exterior gardens, and interactive 3D walkthroughs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="px-4 py-2.5 rounded-lg border border-[#E2DDD3] bg-white hover:border-[#141E2B] text-[#141E2B] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Compare Projects Matrix
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </button>
          </div>
        </div>

        {/* Live Portfolio Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-white border border-[#E2DDD3]">
            <p className="text-xs text-[#1D2939]/65">Venture Projects</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#141E2B] tabular-nums">
              {ventures.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-[#E2DDD3]">
            <p className="text-xs text-[#1D2939]/65">Total Flats</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#141E2B] tabular-nums">
              {portfolio.totalFlats}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-700/20">
            <p className="text-xs text-emerald-900 font-medium">Available Flats</p>
            <p className="mt-1 font-display text-2xl font-bold text-emerald-900 tabular-nums">
              {portfolio.availableFlats}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-red-50/70 border border-red-700/20">
            <p className="text-xs text-red-900 font-medium">Sold Flats</p>
            <p className="mt-1 font-display text-2xl font-bold text-red-900 tabular-nums">
              {portfolio.soldFlats}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-700/20 col-span-2 sm:col-span-1">
            <p className="text-xs text-blue-900 font-medium">Rented Flats</p>
            <p className="mt-1 font-display text-2xl font-bold text-blue-900 tabular-nums">
              {portfolio.rentedFlats}
            </p>
          </div>
        </div>

        {/* Status Filter Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#141E2B] text-[#FAF8F4]'
                  : 'bg-white border border-[#E2DDD3] text-[#1D2939]/80 hover:border-[#B89452]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Apartment Project Cards Grid */}
        {visibleVentures.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-[#E2DDD3] text-center space-y-3">
            <Building2 className="w-8 h-8 text-[#B89452] mx-auto" />
            <p className="text-sm text-[#1D2939]/75">
              No apartment ventures match the &ldquo;{statusFilter}&rdquo; filter.
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-4 py-2 rounded-lg bg-[#141E2B] text-white text-xs font-medium cursor-pointer"
            >
              Show All Ventures
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {visibleVentures.map((venture) => {
              const stats = computeVentureStats(venture);
              return (
                <article
                  key={venture.id}
                  className="group rounded-2xl bg-white border border-[#E2DDD3] hover:border-[#B89452] overflow-hidden transition-colors flex flex-col"
                >
                  {/* Main Project Image */}
                  <div
                    onClick={() => onSelectVenture(venture.id, false)}
                    className="relative h-64 sm:h-72 overflow-hidden cursor-pointer"
                  >
                    <SafeImage
                      src={venture.mainImageUrl}
                      alt={`${venture.name} exterior architectural view`}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141E2B]/85 via-[#141E2B]/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3 text-[#FAF8F4]">
                      <div>
                        <p className="text-xs font-medium text-[#B89452]">
                          {venture.constructionStatus} · {venture.buildingInfo.configurations.join(' / ')}
                        </p>
                        <h2 className="font-display text-2xl font-bold mt-0.5">{venture.name}</h2>
                      </div>
                      <span className="text-xs font-mono tabular-nums bg-[#141E2B] border border-[#B89452]/50 px-2.5 py-1 rounded-md whitespace-nowrap">
                        {stats.availableFlats} Available
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-xs text-[#1D2939]/80">
                        <MapPin className="w-4 h-4 text-[#B89452] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-[#141E2B]">{venture.location}</div>
                          <div className="text-[#1D2939]/65 mt-0.5">{venture.completeAddress}</div>
                        </div>
                      </div>

                      <p className="text-sm text-[#1D2939]/80 leading-relaxed">
                        {venture.shortDescription}
                      </p>

                      {/* Key Highlights */}
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#1D2939]/75 pt-1">
                        {venture.highlights.slice(0, 4).map((hl) => (
                          <li key={hl} className="truncate">
                            • {hl}
                          </li>
                        ))}
                      </ul>

                      {/* Key Structural & Inventory Metrics */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-2">
                        <div className="p-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]">
                          <p className="text-[11px] text-[#1D2939]/65">Land Area</p>
                          <p className="font-mono text-xs font-bold text-[#141E2B] tabular-nums mt-0.5">
                            {venture.buildingInfo.totalLandAreaSqYds.toLocaleString()} sq.yds
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]">
                          <p className="text-[11px] text-[#1D2939]/65">Floors</p>
                          <p className="font-mono text-xs font-bold text-[#141E2B] tabular-nums mt-0.5">
                            {venture.floors.length} Floors
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]">
                          <p className="text-[11px] text-[#1D2939]/65">Total Flats</p>
                          <p className="font-mono text-xs font-bold text-[#141E2B] tabular-nums mt-0.5">
                            {stats.totalFlats}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-700/20">
                          <p className="text-[11px] text-emerald-900">Available</p>
                          <p className="font-mono text-xs font-bold text-emerald-900 tabular-nums mt-0.5">
                            {stats.availableFlats}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-700/20">
                          <p className="text-[11px] text-red-900">Sold</p>
                          <p className="font-mono text-xs font-bold text-red-900 tabular-nums mt-0.5">
                            {stats.soldFlats}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-700/20">
                          <p className="text-[11px] text-blue-900">Rented</p>
                          <p className="font-mono text-xs font-bold text-blue-900 tabular-nums mt-0.5">
                            {stats.rentedFlats}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2DDD3] flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSelectVenture(venture.id, false)}
                        className="px-4 py-2.5 rounded-lg border border-[#E2DDD3] hover:border-[#141E2B] text-[#141E2B] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectVenture(venture.id, true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#B89452]" />
                        <span>Explore in 360°</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
