import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import type { ApartmentVenture, DirectionCode, FlatUnit } from '../types/realEstate';
import { computeVentureStats } from '../utils/ventureStats';
import { AvailabilityCharts } from '../components/AvailabilityCharts';
import { DirectionalCompassExplorer } from '../components/DirectionalCompassExplorer';
import { EnquiryForm } from '../components/EnquiryForm';
import { FloorExplorer } from '../components/FloorExplorer';
import { Panorama360Viewer } from '../components/Panorama360Viewer';
import { PropertyGallery } from '../components/PropertyGallery';

interface VentureDetailPageProps {
  venture: ApartmentVenture;
  allVentures: ApartmentVenture[];
  autoFocusTour?: boolean;
  onBackToVentures: () => void;
  onUpdateCustomPanorama: (
    ventureId: string,
    nodeId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
  ) => void;
}

export const VentureDetailPage: React.FC<VentureDetailPageProps> = ({
  venture,
  allVentures,
  autoFocusTour = false,
  onBackToVentures,
  onUpdateCustomPanorama,
}) => {
  const stats = computeVentureStats(venture);
  const [activeNodeId, setActiveNodeId] = useState<string>('ext-front');
  const [targetDirection, setTargetDirection] = useState<DirectionCode | null>(null);
  const [targetYaw, setTargetYaw] = useState<number | null>(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(
    venture.floors[0]?.floorIndex ?? 0,
  );
  const [active360FloorIndex, setActive360FloorIndex] = useState<number>(
    venture.floors[0]?.floorIndex ?? 0,
  );
  const [active360FlatId, setActive360FlatId] = useState<string | null>(
    venture.floors[0]?.flats[0]?.id ?? null,
  );
  const [enquiryFlatNumber, setEnquiryFlatNumber] = useState<string>('');
  const [mobileSidePanelOpen, setMobileSidePanelOpen] = useState<boolean>(false);

  const explorerSectionRef = useRef<HTMLDivElement | null>(null);
  const floorSectionRef = useRef<HTMLDivElement | null>(null);
  const overviewSectionRef = useRef<HTMLDivElement | null>(null);
  const contactSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveNodeId('ext-front');
    const defaultFloor = venture.floors[0]?.floorIndex ?? 0;
    setSelectedFloorIndex(defaultFloor);
    setActive360FloorIndex(defaultFloor);
    setActive360FlatId(venture.floors[0]?.flats[0]?.id ?? null);
    setTargetDirection(null);
    setTargetYaw(null);
    setEnquiryFlatNumber('');

    if (autoFocusTour) {
      setTimeout(() => {
        explorerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [venture.id, autoFocusTour]);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExploreDirectionIn360 = (
    nodeId: string,
    bearingDegrees: number,
    direction?: DirectionCode,
  ) => {
    setActiveNodeId(nodeId || 'ext-front');
    setTargetDirection(direction ?? null);
    setTargetYaw(bearingDegrees);
    scrollToRef(explorerSectionRef);
  };

  const handleJumpToFloor = (floorIdx: number) => {
    setSelectedFloorIndex(floorIdx);
    scrollToRef(floorSectionRef);
  };

  const handleContactForFlat = (flat: FlatUnit) => {
    setEnquiryFlatNumber(flat.flatNumber);
    scrollToRef(contactSectionRef);
  };

  const handleSelectFlatFor360 = (floorIndex: number, flatId: string) => {
    setActive360FloorIndex(floorIndex);
    setActive360FlatId(flatId);
    setSelectedFloorIndex(floorIndex);
    setTargetDirection(null);
    setActiveNodeId('flat-gate');
    scrollToRef(explorerSectionRef);
  };

  return (
    <div className="bg-[#FAF8F4] min-h-screen pb-16">
      {/* TOP HEADER */}
      <section ref={overviewSectionRef} className="bg-[#141E2B] text-[#FAF8F4] border-b border-[#243244]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToVentures}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B89452] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Ventures</span>
            </button>

            <div className="text-xs text-[#FAF8F4]/75 font-medium">
              {venture.constructionStatus} · {venture.buildingInfo.configurations.join(' / ')}
            </div>
          </div>

          <div className="mt-3 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                {venture.name}
              </h1>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-[#FAF8F4]/80">
                <MapPin className="w-4 h-4 text-[#B89452] shrink-0 mt-0.5" />
                <span>{venture.completeAddress}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => scrollToRef(explorerSectionRef)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4" />
                <span>360° Walkthrough</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToRef(floorSectionRef)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#FAF8F4]/25 hover:bg-[#FAF8F4]/10 text-[#FAF8F4] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Layers className="w-4 h-4" />
                <span>Floor Plans</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToRef(contactSectionRef)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F3EFE8] text-[#141E2B] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enquire</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 360° APARTMENT EXPLORER + PROJECT OVERVIEW SIDEBAR */}
      <section
        ref={explorerSectionRef}
        className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-7"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <Panorama360Viewer
              ventureId={venture.id}
              ventureName={venture.name}
              nodes={venture.panoramas}
              floors={venture.floors}
              activeNodeId={activeNodeId}
              activeFlatFloorIndex={active360FloorIndex}
              activeFlatId={active360FlatId}
              targetDirection={targetDirection}
              targetYaw={targetYaw}
              onSelectNode={(nodeId) => {
                setActiveNodeId(nodeId);
                setTargetDirection(null);
                setTargetYaw(null);
              }}
              onSelectFlatFor360={handleSelectFlatFor360}
              onJumpToFloor={handleJumpToFloor}
              onExitTour={() => scrollToRef(floorSectionRef)}
              onUploadCustomPanorama={(nodeId, mediaUrl, mediaType) =>
                onUpdateCustomPanorama(venture.id, nodeId, mediaUrl, mediaType)
              }
            />
          </div>

          {/* SIDE PANEL */}
          <aside className="lg:col-span-4 bg-white rounded-2xl border border-[#E2DDD3] overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSidePanelOpen((prev) => !prev)}
              className="lg:hidden w-full px-5 py-4 flex items-center justify-between bg-[#F3EFE8] text-[#141E2B] font-display font-bold text-sm cursor-pointer"
            >
              <span>Overview &amp; Specifications</span>
              {mobileSidePanelOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <div className={`${mobileSidePanelOpen ? 'block' : 'hidden'} lg:block p-6 space-y-5`}>
              <div>
                <h2 className="font-display text-lg font-bold text-[#141E2B]">Overview</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#1D2939]/80 leading-relaxed">
                  {venture.overviewDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2DDD3]">
                <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3]">
                  <span className="text-[11px] text-[#1D2939]/65">Floors</span>
                  <div className="font-mono text-lg font-bold text-[#141E2B] tabular-nums">
                    {venture.floors.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3]">
                  <span className="text-[11px] text-[#1D2939]/65">Total Flats</span>
                  <div className="font-mono text-lg font-bold text-[#141E2B] tabular-nums">
                    {stats.totalFlats}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-700/20">
                  <span className="text-[11px] text-emerald-900 font-medium">Available</span>
                  <div className="font-mono text-lg font-bold text-emerald-900 tabular-nums">
                    {stats.availableFlats}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-700/20">
                  <span className="text-[11px] text-red-900 font-medium">Sold</span>
                  <div className="font-mono text-lg font-bold text-red-900 tabular-nums">
                    {stats.soldFlats}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-700/20">
                  <span className="text-[11px] text-blue-900 font-medium">Rented</span>
                  <div className="font-mono text-lg font-bold text-blue-900 tabular-nums">
                    {stats.rentedFlats}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-700/20">
                  <span className="text-[11px] text-amber-900 font-medium">Reserved</span>
                  <div className="font-mono text-lg font-bold text-amber-900 tabular-nums">
                    {stats.reservedFlats}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2DDD3] text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#1D2939]/70">Land Area</span>
                  <span className="font-mono font-bold text-[#141E2B] tabular-nums">
                    {venture.buildingInfo.totalLandAreaSqYds.toLocaleString()} sq. yds
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#1D2939]/70">Built-Up Area</span>
                  <span className="font-mono font-bold text-[#141E2B] tabular-nums">
                    {venture.buildingInfo.totalBuiltUpAreaSqFt.toLocaleString()} sq. ft
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#1D2939]/70">Configurations</span>
                  <span className="font-semibold text-[#141E2B]">
                    {venture.buildingInfo.configurations.join(', ')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#141E2B]">Site Location</span>
                  <span className="font-mono text-[11px] text-[#1D2939]/65 tabular-nums">
                    {venture.coordinates.lat.toFixed(4)}, {venture.coordinates.lng.toFixed(4)}
                  </span>
                </div>
                <a
                  href={venture.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors"
                >
                  <span>Open Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ORGANIZED DETAIL SECTIONS */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Flat Availability Dashboard */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#141E2B]">
            Flat Availability Summary
          </h2>
          <AvailabilityCharts stats={stats} projectName={venture.name} />
        </section>

        {/* Architectural Highlights & Amenities */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-[#141E2B]">
              Architectural Highlights
            </h3>
            <ul className="space-y-2.5">
              {venture.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#1D2939]/85">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6B53] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-[#E2DDD3] flex items-start gap-2.5 text-xs">
              <Car className="w-4 h-4 text-[#B89452] shrink-0 mt-0.5" />
              <span className="text-[#1D2939]/80">{venture.buildingInfo.parkingFacilities}</span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-[#141E2B]">
              Amenities &amp; Greenery
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {venture.buildingInfo.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] flex items-center gap-2 text-xs font-medium text-[#141E2B]"
                >
                  <Building2 className="w-4 h-4 text-[#4A6B53] shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8-Direction Orientation Explorer */}
        <section>
          <DirectionalCompassExplorer
            views={venture.directionalViews}
            projectName={venture.name}
            onExploreIn360={handleExploreDirectionIn360}
          />
        </section>

        {/* Floor Plans & Apartment Configurations */}
        <section ref={floorSectionRef}>
          <FloorExplorer
            floors={venture.floors}
            projectName={venture.name}
            selectedFloorIndex={selectedFloorIndex}
            onSelectFloor={setSelectedFloorIndex}
            onContactForFlat={handleContactForFlat}
            onLaunch360Interior={handleSelectFlatFor360}
          />
        </section>

        {/* Building Exterior & Interior Gallery */}
        <section>
          <PropertyGallery items={venture.gallery} projectName={venture.name} />
        </section>

        {/* Contact & Enquiry */}
        <section
          ref={contactSectionRef}
          className="bg-white rounded-2xl border border-[#E2DDD3] p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-5 space-y-2.5">
            <h3 className="font-display text-2xl font-bold text-[#141E2B]">
              Enquire — {venture.name}
            </h3>
            <p className="text-sm text-[#1D2939]/75">
              Request pricing schedules or arrange an on-site visit with our advisory team.
            </p>
            {enquiryFlatNumber && (
              <div className="p-3 rounded-xl bg-[#F3EFE8] border border-[#E2DDD3] text-xs font-semibold text-[#141E2B]">
                Selected Unit: Flat {enquiryFlatNumber}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <EnquiryForm
              ventures={allVentures}
              initialVentureId={venture.id}
              initialFlatNumber={enquiryFlatNumber}
              compact
            />
          </div>
        </section>
      </div>
    </div>
  );
};
