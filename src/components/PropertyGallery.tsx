import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { GalleryCategory, GalleryItem } from '../types/realEstate';
import { SafeImage } from './SafeImage';

interface PropertyGalleryProps {
  items: GalleryItem[];
  projectName: string;
}

const CATEGORIES: Array<'All' | GalleryCategory> = [
  'All',
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

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ items, projectName }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | GalleryCategory>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const filtered =
    activeCategory === 'All' ? items : items.filter((item) => item.category === activeCategory);

  const activeItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setZoomScale(1);
  };

  const stepLightbox = (dir: -1 | 1) => {
    if (lightboxIndex === null || filtered.length === 0) return;
    setLightboxIndex((lightboxIndex + dir + filtered.length) % filtered.length);
    setZoomScale(1);
  };

  const toggleFullscreen = async (el: HTMLElement | null) => {
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2DDD3] p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E2DDD3]">
        <div>
          <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
            Property Image Gallery
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-[#141E2B]">
            Building Exterior Views &amp; Interiors
          </h3>
          <p className="mt-1 text-sm text-[#1D2939]/75">
            Browse every space category or click any photograph for full-screen zoom inspection.
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-[#1D2939]/65">
          Showing {filtered.length} of {items.length} media assets
        </span>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveCategory(cat);
              setLightboxIndex(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#141E2B] text-[#FAF8F4]'
                : 'bg-[#FAF8F4] text-[#1D2939]/80 hover:bg-[#F3EFE8]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Photo Grid */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl bg-[#FAF8F4] border border-[#E2DDD3] text-center text-sm text-[#1D2939]/70">
          No gallery photographs uploaded for &ldquo;{activeCategory}&rdquo; yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(idx)}
              className="group text-left rounded-xl overflow-hidden border border-[#E2DDD3] bg-[#FAF8F4] hover:border-[#B89452] transition-colors cursor-pointer flex flex-col"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <SafeImage
                  src={item.imageUrl}
                  alt={`${projectName} — ${item.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 p-2 rounded-lg bg-[#141E2B]/85 text-[#FAF8F4] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#4A6B53]">
                    {item.category}
                  </p>
                  <h4 className="mt-1 font-display text-base font-semibold text-[#141E2B]">
                    {item.title}
                  </h4>
                </div>
                <p className="mt-1.5 text-xs text-[#1D2939]/70 line-clamp-2">{item.caption}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          id="gallery-lightbox-root"
          className="fixed inset-0 z-50 bg-[#141E2B]/95 text-[#FAF8F4] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-4 sm:px-6 py-3.5 border-b border-[#243244] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-[#B89452] font-medium">
                {activeItem.category} · {lightboxIndex + 1} / {filtered.length}
              </p>
              <h4 className="font-display text-base sm:text-lg font-bold truncate">
                {activeItem.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(1, Number((s - 0.35).toFixed(2))))}
                className="p-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] transition-colors cursor-pointer"
                aria-label="Zoom out photo"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono tabular-nums w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(2.75, Number((s + 0.35).toFixed(2))))}
                className="p-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] transition-colors cursor-pointer"
                aria-label="Zoom in photo"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleFullscreen(document.getElementById('gallery-lightbox-root'))}
                className="p-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] transition-colors cursor-pointer"
                aria-label="Toggle full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] transition-colors cursor-pointer"
                aria-label="Close gallery viewer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
            <button
              type="button"
              onClick={() => stepLightbox(-1)}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#141E2B]/90 border border-[#243244] hover:border-[#B89452] text-white cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="max-w-5xl max-h-full overflow-hidden rounded-xl border border-[#243244]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                style={{ transform: `scale(${zoomScale})` }}
                className="max-h-[72vh] w-auto object-contain transition-transform duration-200 origin-center"
              />
            </div>

            <button
              type="button"
              onClick={() => stepLightbox(1)}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#141E2B]/90 border border-[#243244] hover:border-[#B89452] text-white cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-3 border-t border-[#243244] text-center text-xs sm:text-sm text-[#FAF8F4]/85">
            {activeItem.caption}
          </div>
        </div>
      )}
    </div>
  );
};
