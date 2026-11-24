import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  ApartmentVenture,
  ConstructionStatus,
  DirectionCode,
  FlatStatus,
  FlatUnit,
  FloorPlan,
  GalleryCategory,
  PropertyEnquiry,
} from '../types/realEstate';
import {
  computeVentureStats,
  DIRECTION_ORDER,
  STATUS_COLORS,
  validateVentureIntegrity,
} from '../utils/ventureStats';

interface AdminPortalPageProps {
  ventures: ApartmentVenture[];
  onSaveVenture: (updated: ApartmentVenture) => Promise<{ ok: boolean; error?: string }>;
  onCreateVenture: (created: ApartmentVenture) => Promise<{ ok: boolean; error?: string }>;
  onResetAll: () => Promise<void>;
  onBackToVentures: () => void;
}

type AdminTab = 'overview' | 'floors' | 'panoramas' | 'directions' | 'gallery' | 'enquiries';

const CONSTRUCTION_STATUSES: ConstructionStatus[] = [
  'Ready to Move',
  'Finishing Stage',
  'Under Construction',
  'New Launch',
];

const FLAT_STATUSES: FlatStatus[] = ['Available', 'Sold', 'Rented', 'Reserved'];

const GALLERY_CATEGORIES: GalleryCategory[] = [
  'Building Exterior',
  'Building Interior',
  'Entrance',
  'Living Room',
  'Bedrooms',
  'Kitchen',
  'Bathrooms',
  'Balconies',
  'Parking',
  'Amenities',
  'Surrounding Roads',
];

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  ventures,
  onSaveVenture,
  onCreateVenture,
  onResetAll,
  onBackToVentures,
}) => {
  const [selectedId, setSelectedId] = useState<string>(ventures[0]?.id ?? '');
  const [draft, setDraft] = useState<ApartmentVenture | null>(
    ventures[0] ? structuredClone(ventures[0]) : null,
  );
  const [activeTab, setActiveTab] = useState<AdminTab>('floors');
  const [selectedFloorIdx, setSelectedFloorIdx] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [enquiries, setEnquiries] = useState<PropertyEnquiry[]>([]);

  // New flat form state
  const [newFlatNum, setNewFlatNum] = useState('');
  const [newFlatBhk, setNewFlatBhk] = useState('3 BHK');
  const [newFlatCarpet, setNewFlatCarpet] = useState(1420);
  const [newFlatBuiltUp, setNewFlatBuiltUp] = useState(1675);
  const [newFlatSuper, setNewFlatSuper] = useState(1905);
  const [newFlatLandShare, setNewFlatLandShare] = useState(60);
  const [newFlatFacing, setNewFlatFacing] = useState<DirectionCode>('NE');
  const [newFlatPrice, setNewFlatPrice] = useState('$350,000');

  // New gallery item state
  const [newGalCat, setNewGalCat] = useState<GalleryCategory>('Building Exterior');
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCaption, setNewGalCaption] = useState('');
  const [newGalUrl, setNewGalUrl] = useState('');

  useEffect(() => {
    const match = ventures.find((v) => v.id === selectedId) ?? ventures[0];
    if (match) {
      setDraft(structuredClone(match));
      setSelectedFloorIdx(match.floors[0]?.floorIndex ?? 0);
    }
  }, [selectedId, ventures]);

  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetch('/api/enquiries')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data.enquiries)) setEnquiries(data.enquiries);
        })
        .catch(() => {});
    }
  }, [activeTab]);

  if (!draft) return null;

  const stats = computeVentureStats(draft);
  const validationErrors = validateVentureIntegrity(draft);

  const handleSave = async () => {
    setFeedback(null);
    if (validationErrors.length > 0) {
      setFeedback({ type: 'err', msg: validationErrors[0] });
      return;
    }
    setSaving(true);
    const res = await onSaveVenture(draft);
    setSaving(false);
    if (res.ok) {
      setFeedback({
        type: 'ok',
        msg: `Saved changes to ${draft.name}. Live dashboards and floor plans are updated.`,
      });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Failed to save changes.' });
    }
  };

  const handleFlatFieldChange = <K extends keyof FlatUnit>(
    floorIndex: number,
    flatId: string,
    field: K,
    value: FlatUnit[K],
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        floors: prev.floors.map((floor) =>
          floor.floorIndex === floorIndex
            ? {
                ...floor,
                flats: floor.flats.map((flat) =>
                  flat.id === flatId ? { ...flat, [field]: value } : flat,
                ),
              }
            : floor,
        ),
      };
    });
  };

  const handleAddFloor = () => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextIdx =
        prev.floors.length > 0 ? Math.max(...prev.floors.map((f) => f.floorIndex)) + 1 : 0;
      const ordinals = [
        'Ground Floor',
        'First Floor',
        'Second Floor',
        'Third Floor',
        'Fourth Floor',
        'Fifth Floor',
        'Sixth Floor',
        'Seventh Floor',
      ];
      const nextFloor: FloorPlan = {
        floorIndex: nextIdx,
        floorName: ordinals[nextIdx] || `Floor ${nextIdx}`,
        floorSummary: 'Newly added floor level · Configure units below',
        flats: [],
      };
      setSelectedFloorIdx(nextIdx);
      return {
        ...prev,
        floors: [...prev.floors, nextFloor],
      };
    });
  };

  const handleAddFlat = (floorIndex: number) => {
    if (!newFlatNum.trim()) {
      setFeedback({ type: 'err', msg: 'Enter a flat number before adding a unit.' });
      return;
    }
    setDraft((prev) => {
      if (!prev) return prev;
      const floor = prev.floors.find((f) => f.floorIndex === floorIndex);
      if (!floor) return prev;

      if (
        floor.flats.some(
          (f) => f.flatNumber.trim().toLowerCase() === newFlatNum.trim().toLowerCase(),
        )
      ) {
        setFeedback({
          type: 'err',
          msg: `Flat ${newFlatNum.trim()} already exists on ${floor.floorName}.`,
        });
        return prev;
      }

      const slot = floor.flats.length % 4;
      const boundsList = [
        { x: 32, y: 34, w: 230, h: 150 },
        { x: 338, y: 34, w: 230, h: 150 },
        { x: 32, y: 236, w: 230, h: 150 },
        { x: 338, y: 236, w: 230, h: 150 },
      ];

      const newUnit: FlatUnit = {
        id: `${prev.id}-flat-${Date.now()}`,
        flatNumber: newFlatNum.trim(),
        floorIndex,
        floorLabel: floor.floorName,
        bhk: newFlatBhk,
        carpetAreaSqFt: Number(newFlatCarpet) || 1200,
        builtUpAreaSqFt: Number(newFlatBuiltUp) || 1450,
        superBuiltUpAreaSqFt: Number(newFlatSuper) || 1680,
        landShareSqYds: Number(newFlatLandShare) || 55,
        facing: newFlatFacing,
        balconyDetails: '1 Covered Balcony (110 sq.ft)',
        bedrooms: newFlatBhk.startsWith('2') ? 2 : newFlatBhk.startsWith('4') ? 4 : 3,
        bathrooms: newFlatBhk.startsWith('2') ? 2 : 3,
        parkingDetails: `1 Covered Bay (${newFlatNum.trim()}-A)`,
        price: newFlatPrice.trim() || 'Upon Request',
        status: 'Available',
        svgBounds: boundsList[slot],
      };

      setNewFlatNum('');
      setFeedback(null);

      return {
        ...prev,
        floors: prev.floors.map((f) =>
          f.floorIndex === floorIndex ? { ...f, flats: [...f.flats, newUnit] } : f,
        ),
      };
    });
  };

  const handleDeleteFlat = (floorIndex: number, flatId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        floors: prev.floors.map((f) =>
          f.floorIndex === floorIndex
            ? { ...f, flats: f.flats.filter((u) => u.id !== flatId) }
            : f,
        ),
      };
    });
  };

  const handleFileToDataUrl = (file: File, onReady: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onReady(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewVenture = async () => {
    const num = ventures.length + 1;
    const base = structuredClone(ventures[0]);
    const slug = `venture-${Date.now()}`;
    const created: ApartmentVenture = {
      ...base,
      id: slug,
      name: `Venture Project #${num}`,
      tagline: 'New Residential Venture (Placeholder)',
      location: 'Hyderabad Metropolitan Area',
      completeAddress: 'New Parcel Address (Update via Admin)',
      constructionStatus: 'New Launch',
      isPlaceholderDetails: true,
      floors: base.floors.slice(0, 2).map((fl, idx) => ({
        ...fl,
        floorIndex: idx,
        flats: fl.flats.map((u) => ({
          ...u,
          id: `${slug}-flat-${u.flatNumber}`,
          status: 'Available',
        })),
      })),
      panoramas: base.panoramas.map((p) => ({
        ...p,
        id: `${slug}-${p.id}`,
      })),
    };
    const res = await onCreateVenture(created);
    if (res.ok) {
      setSelectedId(created.id);
      setFeedback({ type: 'ok', msg: `Created ${created.name}. Edit details below.` });
    } else {
      setFeedback({ type: 'err', msg: res.error || 'Could not create new venture.' });
    }
  };

  const activeFloor =
    draft.floors.find((f) => f.floorIndex === selectedFloorIdx) ?? draft.floors[0];

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Admin Header */}
        <div className="bg-[#141E2B] text-[#FAF8F4] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <button
              type="button"
              onClick={onBackToVentures}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B89452] hover:text-white mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Ventures</span>
            </button>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Ventures &amp; Inventory Administration
            </h1>
            <p className="text-xs sm:text-sm text-[#FAF8F4]/80 mt-1">
              Manage apartment details, floor plans, flat availability, 8-direction metadata, 360° Insta360 media, and road connections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCreateNewVenture}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#FAF8F4]/25 hover:bg-[#FAF8F4]/10 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Venture</span>
            </button>
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[#FAF8F4]/25 hover:bg-[#FAF8F4]/10 text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || validationErrors.length > 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#4A6B53] hover:bg-[#B89452] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Venture Changes'}</span>
            </button>
          </div>
        </div>

        {/* Project Selector & Live Validation / Feedback */}
        <div className="bg-white rounded-2xl border border-[#E2DDD3] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {ventures.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedId(v.id);
                  setFeedback(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  v.id === draft.id
                    ? 'bg-[#141E2B] text-[#FAF8F4]'
                    : 'bg-[#FAF8F4] border border-[#E2DDD3] text-[#1D2939] hover:border-[#4A6B53]'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
            <span>Total: {stats.totalFlats}</span>
            <span className="text-emerald-700 font-semibold">Avail: {stats.availableFlats}</span>
            <span className="text-red-700 font-semibold">Sold: {stats.soldFlats}</span>
            <span className="text-blue-700 font-semibold">Rented: {stats.rentedFlats}</span>
            <span className="text-amber-700 font-semibold">Reserved: {stats.reservedFlats}</span>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Validation Warnings (fix before saving):</span>
            </div>
            {validationErrors.map((err) => (
              <p key={err}>• {err}</p>
            ))}
          </div>
        )}

        {feedback && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
              feedback.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              ['floors', 'Floors & Flat Availability'],
              ['overview', 'Project & Building Details'],
              ['panoramas', '360° Media & Road Links'],
              ['directions', '8-Direction Notes'],
              ['gallery', 'Photo Gallery'],
              ['enquiries', 'Customer Enquiries'],
            ] as Array<[AdminTab, string]>
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeTab === tabKey
                  ? 'bg-[#4A6B53] text-white'
                  : 'bg-white border border-[#E2DDD3] text-[#1D2939]/80 hover:border-[#4A6B53]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: FLOORS & FLAT AVAILABILITY */}
        {activeTab === 'floors' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {draft.floors.map((fl) => (
                  <button
                    key={fl.floorIndex}
                    type="button"
                    onClick={() => setSelectedFloorIdx(fl.floorIndex)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                      fl.floorIndex === activeFloor?.floorIndex
                        ? 'bg-[#141E2B] text-white'
                        : 'bg-[#FAF8F4] border border-[#E2DDD3] text-[#1D2939]'
                    }`}
                  >
                    {fl.floorName} ({fl.flats.length})
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddFloor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#141E2B] text-[#141E2B] hover:bg-[#F3EFE8] text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Floor</span>
              </button>
            </div>

            {activeFloor && (
              <>
                {/* Floor Metadata & Blueprint Upload */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3]">
                  <div>
                    <label className="block text-xs font-medium text-[#1D2939]/75 mb-1">
                      Floor Name
                    </label>
                    <input
                      type="text"
                      value={activeFloor.floorName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                floors: prev.floors.map((f) =>
                                  f.floorIndex === activeFloor.floorIndex
                                    ? {
                                        ...f,
                                        floorName: val,
                                        flats: f.flats.map((u) => ({ ...u, floorLabel: val })),
                                      }
                                    : f,
                                ),
                              }
                            : prev,
                        );
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1D2939]/75 mb-1">
                      Floor Summary
                    </label>
                    <input
                      type="text"
                      value={activeFloor.floorSummary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                floors: prev.floors.map((f) =>
                                  f.floorIndex === activeFloor.floorIndex
                                    ? { ...f, floorSummary: val }
                                    : f,
                                ),
                              }
                            : prev,
                        );
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E2DDD3] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1D2939]/75 mb-1">
                      Custom Floor Plan Image (Optional)
                    </label>
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E2DDD3] hover:border-[#4A6B53] text-xs font-medium cursor-pointer w-full">
                      <Upload className="w-3.5 h-3.5 text-[#4A6B53]" />
                      <span className="truncate">
                        {activeFloor.blueprintImageUrl ? 'Replace Floor Plan' : 'Upload Blueprint'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          handleFileToDataUrl(f, (url) => {
                            setDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    floors: prev.floors.map((fl) =>
                                      fl.floorIndex === activeFloor.floorIndex
                                        ? { ...fl, blueprintImageUrl: url }
                                        : fl,
                                    ),
                                  }
                                : prev,
                            );
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Editable Flats Table */}
                <div className="overflow-x-auto border border-[#E2DDD3] rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[940px] text-xs">
                    <thead>
                      <tr className="bg-[#F3EFE8] text-[#141E2B] font-semibold">
                        <th className="py-3 px-3">Flat #</th>
                        <th className="py-3 px-3">Config</th>
                        <th className="py-3 px-3">Facing</th>
                        <th className="py-3 px-3">Carpet (sf)</th>
                        <th className="py-3 px-3">Built-Up (sf)</th>
                        <th className="py-3 px-3">Super BA (sf)</th>
                        <th className="py-3 px-3">Land (sy)</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Availability Status</th>
                        <th className="py-3 px-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD3]">
                      {activeFloor.flats.map((flat) => (
                        <tr key={flat.id} className="hover:bg-[#FAF8F4]">
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={flat.flatNumber}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'flatNumber',
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={flat.bhk}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'bhk',
                                  e.target.value,
                                )
                              }
                              className="w-28 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={flat.facing}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'facing',
                                  e.target.value as DirectionCode,
                                )
                              }
                              className="px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono"
                            >
                              {DIRECTION_ORDER.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={flat.carpetAreaSqFt}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'carpetAreaSqFt',
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={flat.builtUpAreaSqFt}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'builtUpAreaSqFt',
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={flat.superBuiltUpAreaSqFt}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'superBuiltUpAreaSqFt',
                                  Number(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              value={flat.landShareSqYds}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'landShareSqYds',
                                  Number(e.target.value),
                                )
                              }
                              className="w-16 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono tabular-nums"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={flat.price}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'price',
                                  e.target.value,
                                )
                              }
                              className="w-28 px-2 py-1.5 rounded border border-[#E2DDD3] bg-white font-mono"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={flat.status}
                              onChange={(e) =>
                                handleFlatFieldChange(
                                  activeFloor.floorIndex,
                                  flat.id,
                                  'status',
                                  e.target.value as FlatStatus,
                                )
                              }
                              className={`px-2.5 py-1.5 rounded border font-semibold ${STATUS_COLORS[flat.status].bg} ${STATUS_COLORS[flat.status].border} ${STATUS_COLORS[flat.status].text}`}
                            >
                              {FLAT_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteFlat(activeFloor.floorIndex, flat.id)}
                              className="p-1.5 rounded text-red-700 hover:bg-red-50 cursor-pointer"
                              aria-label={`Delete flat ${flat.flatNumber}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Flat Form */}
                <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-3">
                  <p className="text-xs font-bold text-[#141E2B]">
                    Add New Flat to {activeFloor.floorName}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 items-end text-xs">
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Flat #</label>
                      <input
                        type="text"
                        value={newFlatNum}
                        onChange={(e) => setNewFlatNum(e.target.value)}
                        placeholder="e.g. 505"
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">BHK</label>
                      <input
                        type="text"
                        value={newFlatBhk}
                        onChange={(e) => setNewFlatBhk(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Carpet sf</label>
                      <input
                        type="number"
                        value={newFlatCarpet}
                        onChange={(e) => setNewFlatCarpet(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Built-Up sf</label>
                      <input
                        type="number"
                        value={newFlatBuiltUp}
                        onChange={(e) => setNewFlatBuiltUp(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Super BA sf</label>
                      <input
                        type="number"
                        value={newFlatSuper}
                        onChange={(e) => setNewFlatSuper(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Facing</label>
                      <select
                        value={newFlatFacing}
                        onChange={(e) => setNewFlatFacing(e.target.value as DirectionCode)}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      >
                        {DIRECTION_ORDER.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-[#1D2939]/70">Price</label>
                      <input
                        type="text"
                        value={newFlatPrice}
                        onChange={(e) => setNewFlatPrice(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFlat(activeFloor.floorIndex)}
                      className="py-2 px-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-white font-semibold cursor-pointer"
                    >
                      + Add Flat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: PROJECT & BUILDING DETAILS */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-5">
            <h2 className="font-display text-xl font-bold text-[#141E2B]">
              Project Overview &amp; Structural Specs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Short Location
                </label>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Construction Status
                </label>
                <select
                  value={draft.constructionStatus}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      constructionStatus: e.target.value as ConstructionStatus,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                >
                  {CONSTRUCTION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Complete Site Address
                </label>
                <input
                  type="text"
                  value={draft.completeAddress}
                  onChange={(e) => setDraft({ ...draft, completeAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={draft.googleMapsUrl}
                  onChange={(e) => setDraft({ ...draft, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Total Land Area (sq. yds)
                </label>
                <input
                  type="number"
                  value={draft.buildingInfo.totalLandAreaSqYds}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      buildingInfo: {
                        ...draft.buildingInfo,
                        totalLandAreaSqYds: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Total Built-Up Area (sq. ft)
                </label>
                <input
                  type="number"
                  value={draft.buildingInfo.totalBuiltUpAreaSqFt}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      buildingInfo: {
                        ...draft.buildingInfo,
                        totalBuiltUpAreaSqFt: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Total Blocks / Towers
                </label>
                <input
                  type="number"
                  value={draft.buildingInfo.totalBlocks}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      buildingInfo: {
                        ...draft.buildingInfo,
                        totalBlocks: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Short Description (Card Summary)
                </label>
                <textarea
                  rows={3}
                  value={draft.shortDescription}
                  onChange={(e) => setDraft({ ...draft, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1D2939]/70 mb-1">
                  Full Project Overview
                </label>
                <textarea
                  rows={3}
                  value={draft.overviewDescription}
                  onChange={(e) => setDraft({ ...draft, overviewDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF8F4] border border-[#E2DDD3]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 360° MEDIA & ROAD NAVIGATION CONNECTIONS */}
        {activeTab === 'panoramas' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold text-[#141E2B]">
                360° Insta360 Viewpoints &amp; Road Navigation Links
              </h2>
              <p className="text-xs text-[#1D2939]/75 mt-1">
                Upload equirectangular 360° images or MP4 videos and configure Forward / Backward / Left / Right spatial road links.
              </p>
            </div>

            <div className="space-y-4">
              {draft.panoramas.map((node, idx) => (
                <div
                  key={node.id}
                  className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-medium mb-1">Viewpoint Title</label>
                      <input
                        type="text"
                        value={node.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  panoramas: prev.panoramas.map((p, i) =>
                                    i === idx ? { ...p, title: val } : p,
                                  ),
                                }
                              : prev,
                          );
                        }}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Compass Heading Label</label>
                      <input
                        type="text"
                        value={node.compassHeadingLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  panoramas: prev.panoramas.map((p, i) =>
                                    i === idx ? { ...p, compassHeadingLabel: val } : p,
                                  ),
                                }
                              : prev,
                          );
                        }}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Media Type</label>
                      <select
                        value={node.mediaType}
                        onChange={(e) => {
                          const val = e.target.value as 'image' | 'video';
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  panoramas: prev.panoramas.map((p, i) =>
                                    i === idx ? { ...p, mediaType: val } : p,
                                  ),
                                }
                              : prev,
                          );
                        }}
                        className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                      >
                        <option value="image">Equirectangular Image</option>
                        <option value="video">360° Video (.mp4/.webm)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Upload 360° File</label>
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141E2B] text-white cursor-pointer w-full justify-center">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Insta360 Asset</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const isVid = f.type.startsWith('video/');
                            if (isVid) {
                              const url = URL.createObjectURL(f);
                              setDraft((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      panoramas: prev.panoramas.map((p, i) =>
                                        i === idx
                                          ? {
                                              ...p,
                                              mediaType: 'video',
                                              mediaUrl: url,
                                              isPlaceholderMedia: false,
                                            }
                                          : p,
                                      ),
                                    }
                                  : prev,
                              );
                            } else {
                              handleFileToDataUrl(f, (dataUrl) => {
                                setDraft((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        panoramas: prev.panoramas.map((p, i) =>
                                          i === idx
                                            ? {
                                                ...p,
                                                mediaType: 'image',
                                                mediaUrl: dataUrl,
                                                isPlaceholderMedia: false,
                                              }
                                            : p,
                                        ),
                                      }
                                    : prev,
                                );
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Road Connections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#E2DDD3]">
                    {(
                      [
                        ['forwardNodeId', 'Forward Arrow Target'],
                        ['backwardNodeId', 'Backward Arrow Target'],
                        ['leftNodeId', 'Left Arrow Target'],
                        ['rightNodeId', 'Right Arrow Target'],
                      ] as const
                    ).map(([connKey, label]) => (
                      <div key={connKey}>
                        <label className="block font-medium mb-1 text-[#141E2B]">{label}</label>
                        <select
                          value={node.connections[connKey] || ''}
                          onChange={(e) => {
                            const target = e.target.value || undefined;
                            setDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    panoramas: prev.panoramas.map((p, i) =>
                                      i === idx
                                        ? {
                                            ...p,
                                            connections: {
                                              ...p.connections,
                                              [connKey]: target,
                                            },
                                          }
                                        : p,
                                    ),
                                  }
                                : prev,
                            );
                          }}
                          className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                        >
                          <option value="">None</option>
                          {draft.panoramas
                            .filter((other) => other.id !== node.id)
                            .map((other) => (
                              <option key={other.id} value={other.id}>
                                {other.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 8-DIRECTION ORIENTATION NOTES */}
        {activeTab === 'directions' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#141E2B]">
              Verified 8-Direction Site &amp; Elevation Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draft.directionalViews.map((dv, idx) => (
                <div
                  key={dv.direction}
                  className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#141E2B]">
                    <span>
                      {dv.direction} — {dv.label}
                    </span>
                    <span className="font-mono text-[#4A6B53]">{dv.bearingDegrees}°</span>
                  </div>
                  <textarea
                    rows={2}
                    value={dv.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              directionalViews: prev.directionalViews.map((d, i) =>
                                i === idx ? { ...d, description: val } : d,
                              ),
                            }
                          : prev,
                      );
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                  />
                  <input
                    type="text"
                    value={dv.verifiedSiteNote}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              directionalViews: prev.directionalViews.map((d, i) =>
                                i === idx ? { ...d, verifiedSiteNote: val } : d,
                              ),
                            }
                          : prev,
                      );
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-6">
            <h2 className="font-display text-xl font-bold text-[#141E2B]">
              Property Photographs Manager
            </h2>

            <div className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end text-xs">
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  value={newGalCat}
                  onChange={(e) => setNewGalCat(e.target.value as GalleryCategory)}
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                >
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Photo Title</label>
                <input
                  type="text"
                  value={newGalTitle}
                  onChange={(e) => setNewGalTitle(e.target.value)}
                  placeholder="e.g. East Wing Living"
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Caption</label>
                <input
                  type="text"
                  value={newGalCaption}
                  onChange={(e) => setNewGalCaption(e.target.value)}
                  placeholder="Architectural finish note"
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Upload or URL</label>
                <input
                  type="text"
                  value={newGalUrl}
                  onChange={(e) => setNewGalUrl(e.target.value)}
                  placeholder="/src/assets/images/..."
                  className="w-full px-2.5 py-2 rounded-lg bg-white border border-[#E2DDD3]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newGalTitle.trim() || !newGalUrl.trim()) return;
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          gallery: [
                            ...prev.gallery,
                            {
                              id: `gal-${Date.now()}`,
                              category: newGalCat,
                              title: newGalTitle.trim(),
                              caption: newGalCaption.trim() || newGalTitle.trim(),
                              imageUrl: newGalUrl.trim(),
                              isPlaceholder: false,
                            },
                          ],
                        }
                      : prev,
                  );
                  setNewGalTitle('');
                  setNewGalCaption('');
                  setNewGalUrl('');
                }}
                className="py-2 px-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-white font-semibold cursor-pointer"
              >
                + Add Photo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draft.gallery.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#4A6B53]">{g.category}</p>
                    <p className="text-xs font-bold text-[#141E2B] truncate">{g.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, gallery: prev.gallery.filter((item) => item.id !== g.id) }
                          : prev,
                      )
                    }
                    className="p-1.5 rounded text-red-700 hover:bg-red-50 cursor-pointer shrink-0"
                    aria-label={`Remove ${g.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER ENQUIRIES INBOX */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#141E2B]">
              Submitted Property Enquiries ({enquiries.length})
            </h2>
            {enquiries.length === 0 ? (
              <p className="text-sm text-[#1D2939]/70">
                No customer enquiries submitted yet. Submissions from Contact Us or Flat Details appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="p-4 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#141E2B] text-sm">{enq.name}</span>
                      <span className="font-mono text-[#1D2939]/65">
                        {new Date(enq.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#4A6B53] font-medium">
                      {enq.ventureName || 'General Advisory'}
                      {enq.flatNumber ? ` · Flat ${enq.flatNumber}` : ''} · {enq.email} · {enq.phone}
                    </div>
                    <p className="text-sm text-[#1D2939]/85 pt-1">{enq.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
