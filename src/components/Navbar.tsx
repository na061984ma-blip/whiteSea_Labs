import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { AppPage } from '../types/realEstate';

interface NavbarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage, sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (page: AppPage, sectionId?: string) => {
    setMobileOpen(false);
    onNavigate(page, sectionId);
  };

  const navItems: Array<{ label: string; page: AppPage; sectionId?: string; isMatch: boolean }> = [
    { label: 'Home', page: 'home', sectionId: 'top', isMatch: activePage === 'home' },
    { label: 'About Us', page: 'home', sectionId: 'about', isMatch: false },
    { label: 'Services', page: 'home', sectionId: 'services', isMatch: false },
    {
      label: 'Ventures',
      page: 'ventures',
      isMatch: activePage === 'ventures' || activePage === 'venture-detail',
    },
    { label: 'Projects', page: 'projects', isMatch: activePage === 'projects' },
    { label: 'Testimonials', page: 'home', sectionId: 'testimonials', isMatch: false },
    { label: 'Contact Us', page: 'home', sectionId: 'contact', isMatch: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 border-b border-[#E2DDD3]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => handleLinkClick('home', 'top')}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#141E2B] whitespace-nowrap shrink-0 hover:text-[#4A6B53] transition-colors cursor-pointer"
        >
          Meridian Estates
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1D2939]/80">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.page, item.sectionId)}
              className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                item.isMatch
                  ? 'text-[#141E2B] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#B89452]'
                  : 'hover:text-[#141E2B]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('ventures')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#FAF8F4] bg-[#141E2B] hover:bg-[#4A6B53] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Explore Projects
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-[#E2DDD3] text-[#141E2B] hover:bg-[#F3EFE8] transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2DDD3] bg-[#FAF8F4] px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.page, item.sectionId)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                item.isMatch
                  ? 'bg-[#141E2B] text-[#FAF8F4]'
                  : 'text-[#1D2939] hover:bg-[#F3EFE8]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#E2DDD3]">
            <button
              type="button"
              onClick={() => handleLinkClick('admin')}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border border-[#E2DDD3] text-[#141E2B] text-center cursor-pointer"
            >
              Admin Management
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
