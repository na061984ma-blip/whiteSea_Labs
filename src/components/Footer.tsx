import React from 'react';
import type { ApartmentVenture, AppPage } from '../types/realEstate';

interface FooterProps {
  ventures: ApartmentVenture[];
  onNavigate: (page: AppPage, sectionId?: string) => void;
  onSelectVenture: (ventureId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ ventures, onNavigate, onSelectVenture }) => {
  return (
    <footer className="bg-[#141E2B] text-[#FAF8F4] border-t border-[#243244]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-[#FAF8F4]">
            Meridian Estates
          </h3>
          <p className="mt-2.5 text-xs text-[#FAF8F4]/70 leading-relaxed">
            Residential developments with independent architecture, verified availability, and interactive 3D 360-degree virtual tours.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[#B89452] mb-3">Navigation</h4>
          <ul className="space-y-1.5 text-xs text-[#FAF8F4]/80">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home', 'top')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home', 'about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home', 'services')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Services
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('ventures')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Ventures
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('projects')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Projects
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home', 'testimonials')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Testimonials
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('home', 'contact')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[#B89452] mb-3">Residences</h4>
          <ul className="space-y-1.5 text-xs text-[#FAF8F4]/80">
            {ventures.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => onSelectVenture(v.id)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {v.name} · <span className="text-[#FAF8F4]/55">{v.location}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-[#B89452] mb-3">Management</h4>
          <p className="text-xs text-[#FAF8F4]/75">Plot 14, Maple Palm Avenue, Hyderabad</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 rounded-lg border border-[#FAF8F4]/25 hover:bg-[#FAF8F4]/10 text-[#FAF8F4] text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Admin Management
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#243244] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1320px] mx-auto text-xs text-[#FAF8F4]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Meridian Estates</span>
          <span>Sky Crest Residences · Aurelia Heights · Saffron Quarters · Blue Bay Terrace</span>
        </div>
      </div>
    </footer>
  );
};
