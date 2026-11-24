import React from 'react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { HERO_BANNER_IMAGE, SUITE_PREVIEW_IMAGE } from '../data/venturesSeed';
import type { ApartmentVenture, AppPage } from '../types/realEstate';
import { computePortfolioStats, computeVentureStats } from '../utils/ventureStats';
import { EnquiryForm } from '../components/EnquiryForm';
import { SafeImage } from '../components/SafeImage';

interface HomePageProps {
  ventures: ApartmentVenture[];
  onNavigate: (page: AppPage, sectionId?: string) => void;
  onSelectVenture: (ventureId: string, focus360?: boolean) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  ventures,
  onNavigate,
  onSelectVenture,
}) => {
  const portfolioStats = computePortfolioStats(ventures);

  const services = [
    {
      num: '01',
      title: 'Distinct Architecture',
      desc: 'Four individually planned residential towers with clear structural elevations and shaded setbacks.',
    },
    {
      num: '02',
      title: 'Interactive 3D 360° Tours',
      desc: 'Walk exterior gardens, swimming pools, floor corridors, and furnished flats room by room.',
    },
    {
      num: '03',
      title: '8-Direction Orientation',
      desc: 'Inspect N, NE, E, SE, S, SW, W, and NW bearings linked to exterior viewpoints.',
    },
    {
      num: '04',
      title: 'Live Flat Availability',
      desc: 'Floor-by-floor status with carpet, built-up, and super built-up schedules.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Walking through Flat 204 inside Sky Crest Residences from the corridor into the hall, kitchen, and balcony saved us multiple trips.',
      name: 'Karthik & Meera Deshmukh',
      role: 'Residents · Sky Crest Residences',
    },
    {
      quote:
        'Comparing the garden layout, floor availability, and daylight bearings across projects was effortless.',
      name: 'Dr. Arvind Subramanian',
      role: 'Homeowner · Aurelia Heights',
    },
    {
      quote:
        'Clean site plans, clear room walkthroughs, and transparent area schedules without clutter.',
      name: 'Nandini Kulkarni',
      role: 'Studio Terra Consulting',
    },
  ];

  return (
    <div id="top" className="bg-[#FAF8F4]">
      {/* Hero Section */}
      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-semibold text-[#4A6B53] tracking-wide uppercase">
                Meridian Estates
              </p>
              <h1
                className="mt-3 font-display font-bold text-[#141E2B] tracking-tight leading-[1.1]"
                style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3.35rem)', textWrap: 'balance' }}
              >
                Thoughtful homes you can walk through before visiting.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#1D2939]/75 leading-relaxed max-w-lg">
                Explore Sky Crest Residences, Aurelia Heights, Saffron Quarters, and Blue Bay Terrace across outdoor gardens, floor corridors, and furnished interiors.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('ventures')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E2DDD3] grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-[#1D2939]/60">Residences</p>
                <p className="mt-0.5 font-display text-xl font-bold text-[#141E2B] tabular-nums">
                  {ventures.length} Projects
                </p>
              </div>
              <div>
                <p className="text-[#1D2939]/60">Total Flats</p>
                <p className="mt-0.5 font-display text-xl font-bold text-[#141E2B] tabular-nums">
                  {portfolioStats.totalFlats}
                </p>
              </div>
              <div>
                <p className="text-[#4A6B53] font-medium">Available</p>
                <p className="mt-0.5 font-display text-xl font-bold text-[#4A6B53] tabular-nums">
                  {portfolioStats.availableFlats} Units
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[360px] rounded-2xl overflow-hidden border border-[#E2DDD3]">
              <SafeImage
                src={HERO_BANNER_IMAGE}
                alt="Meridian Estates landscaped courtyard and residential facade"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141E2B]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 text-[#FAF8F4]">
                <div>
                  <p className="text-xs font-medium text-[#B89452]">Featured Residence</p>
                  <p className="font-display text-lg sm:text-xl font-bold">
                    {ventures[0]?.name ?? 'Sky Crest Residences'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSelectVenture(ventures[0]?.id || 'sky-crest-residences', true)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore in 360°</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apartment Projects Showcase */}
      <section className="border-t border-[#E2DDD3] bg-[#F3EFE8]/70 py-14 lg:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
                Residential Ventures
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-bold text-[#141E2B]">
                Four Architectural Communities
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('ventures')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>All Ventures</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ventures.map((venture) => {
              const stats = computeVentureStats(venture);
              return (
                <article
                  key={venture.id}
                  className="rounded-2xl bg-white border border-[#E2DDD3] hover:border-[#B89452] overflow-hidden transition-colors flex flex-col"
                >
                  <div
                    onClick={() => onSelectVenture(venture.id, false)}
                    className="h-48 overflow-hidden cursor-pointer"
                  >
                    <SafeImage
                      src={venture.mainImageUrl}
                      alt={venture.name}
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#4A6B53] font-medium">
                        <span>{venture.constructionStatus}</span>
                        <span className="font-mono tabular-nums text-[#1D2939]/70">
                          {stats.availableFlats}/{stats.totalFlats} Avail
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[#141E2B]">
                        {venture.name}
                      </h3>

                      <p className="text-xs text-[#1D2939]/70 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B89452] shrink-0" />
                        <span className="truncate">{venture.location}</span>
                      </p>

                      <p className="text-xs text-[#1D2939]/80 leading-relaxed line-clamp-2">
                        {venture.shortDescription}
                      </p>

                      <ul className="pt-1 space-y-1 text-[11px] text-[#1D2939]/75">
                        {venture.highlights.slice(0, 2).map((h) => (
                          <li key={h} className="truncate">
                            • {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-[#E2DDD3] grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectVenture(venture.id, false)}
                        className="py-2 px-3 rounded-lg border border-[#E2DDD3] hover:border-[#141E2B] text-[#141E2B] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectVenture(venture.id, true)}
                        className="py-2 px-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Explore in 360°
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-14 lg:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#E2DDD3]">
              <SafeImage
                src={SUITE_PREVIEW_IMAGE}
                alt="Apartment interior suite"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold text-[#B89452] uppercase tracking-wide">
              About Us
            </p>
            <h2 className="font-display text-3xl font-bold text-[#141E2B]">
              Calm proportions, honest materials, and open spatial access.
            </h2>
            <p className="text-sm sm:text-base text-[#1D2939]/75 leading-relaxed max-w-2xl">
              Every Meridian Estates residence combines low-density planning, landscaped gardens, and transparent floor-by-floor inventory with interactive 3D walkthroughs of every room and outdoor space.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t border-[#E2DDD3] bg-[#F3EFE8]/60 py-14 lg:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">Services</p>
          <h2 className="mt-1.5 font-display text-3xl font-bold text-[#141E2B]">
            How We Present Every Property
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((srv) => (
              <div
                key={srv.num}
                className="p-6 rounded-2xl bg-white border border-[#E2DDD3]"
              >
                <span className="font-mono text-xs font-semibold text-[#B89452]">{srv.num}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-[#141E2B]">
                  {srv.title}
                </h3>
                <p className="mt-2 text-xs text-[#1D2939]/75 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-14 lg:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#B89452] uppercase tracking-wide">
            Testimonials
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-bold text-[#141E2B]">
            Resident Perspectives
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white border border-[#E2DDD3] flex flex-col justify-between"
              >
                <p className="text-sm text-[#1D2939]/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 pt-3 border-t border-[#E2DDD3]">
                  <p className="font-display text-sm font-bold text-[#141E2B]">{t.name}</p>
                  <p className="text-xs text-[#1D2939]/65 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section id="contact" className="border-t border-[#E2DDD3] bg-[#F3EFE8]/70 py-14 lg:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-semibold text-[#4A6B53] uppercase tracking-wide">
              Contact Us
            </p>
            <h2 className="font-display text-3xl font-bold text-[#141E2B]">
              Schedule a site visit.
            </h2>
            <p className="text-sm text-[#1D2939]/75 leading-relaxed">
              Request floor plans, pricing schedules, or a guided tour across our four ventures.
            </p>
            <div className="pt-2 text-xs text-[#1D2939]/70">
              Plot 14, Maple Palm Avenue, Jubilee Park North, Hyderabad
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2DDD3] p-6">
            <EnquiryForm ventures={ventures} compact />
          </div>
        </div>
      </section>
    </div>
  );
};
