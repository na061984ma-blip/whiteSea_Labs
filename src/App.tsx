import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { INITIAL_VENTURES } from './data/venturesSeed';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { HomePage } from './pages/HomePage';
import { ProjectsComparePage } from './pages/ProjectsComparePage';
import { VentureDetailPage } from './pages/VentureDetailPage';
import { VenturesPage } from './pages/VenturesPage';
import type { ApartmentVenture, AppPage } from './types/realEstate';

export default function App() {
  const [ventures, setVentures] = useState<ApartmentVenture[]>(INITIAL_VENTURES);
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [selectedVentureId, setSelectedVentureId] = useState<string>(INITIAL_VENTURES[0].id);
  const [autoFocusTour, setAutoFocusTour] = useState<boolean>(false);

  // Fetch persisted ventures from Express backend
  useEffect(() => {
    fetch('/api/ventures')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.ventures) && data.ventures.length > 0) {
          setVentures(data.ventures);
        }
      })
      .catch(() => {
        // Fallback smoothly to INITIAL_VENTURES if offline
      });
  }, []);

  // Sync URL hash navigation
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'ventures') {
        setActivePage('ventures');
      } else if (hash === 'projects') {
        setActivePage('projects');
      } else if (hash === 'admin') {
        setActivePage('admin');
      } else if (hash.startsWith('venture/')) {
        const id = hash.slice('venture/'.length);
        if (id) {
          setSelectedVentureId(id);
          setActivePage('venture-detail');
        }
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleNavigate = useCallback((page: AppPage, sectionId?: string) => {
    setActivePage(page);
    setAutoFocusTour(false);

    if (page === 'ventures') {
      window.location.hash = 'ventures';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'projects') {
      window.location.hash = 'projects';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'admin') {
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'home') {
      window.location.hash = sectionId && sectionId !== 'top' ? sectionId : 'home';
      setTimeout(() => {
        if (sectionId && sectionId !== 'top') {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    }
  }, []);

  const handleSelectVenture = useCallback((ventureId: string, focus360 = false) => {
    setSelectedVentureId(ventureId);
    setAutoFocusTour(focus360);
    setActivePage('venture-detail');
    window.location.hash = `venture/${ventureId}`;
    if (!focus360) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleSaveVenture = async (
    updated: ApartmentVenture,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/ventures/${encodeURIComponent(updated.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Validation error while saving.' };
      }
      setVentures((prev) =>
        prev.map((v) => (v.id === data.venture.id ? data.venture : v)),
      );
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while saving venture.' };
    }
  };

  const handleCreateVenture = async (
    created: ApartmentVenture,
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/ventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Could not create venture.' };
      }
      setVentures((prev) => [...prev, data.venture]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while creating venture.' };
    }
  };

  const handleResetAll = async () => {
    try {
      const res = await fetch('/api/ventures/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.ventures)) {
        setVentures(data.ventures);
      }
    } catch {
      setVentures(INITIAL_VENTURES);
    }
  };

  const handleUpdateCustomPanorama = (
    ventureId: string,
    nodeId: string,
    mediaUrl: string,
    mediaType: 'image' | 'video',
  ) => {
    setVentures((prev) =>
      prev.map((v) =>
        v.id === ventureId
          ? {
              ...v,
              panoramas: v.panoramas.map((p) =>
                p.id === nodeId
                  ? { ...p, mediaUrl, mediaType, isPlaceholderMedia: false }
                  : p,
              ),
            }
          : v,
      ),
    );
  };

  const selectedVenture =
    ventures.find((v) => v.id === selectedVentureId) ?? ventures[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#1D2939]">
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activePage}-${activePage === 'venture-detail' ? selectedVenture?.id : ''}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activePage === 'home' && (
              <HomePage
                ventures={ventures}
                onNavigate={handleNavigate}
                onSelectVenture={handleSelectVenture}
              />
            )}

            {activePage === 'ventures' && (
              <VenturesPage
                ventures={ventures}
                onSelectVenture={handleSelectVenture}
                onNavigate={handleNavigate}
              />
            )}

            {activePage === 'projects' && (
              <ProjectsComparePage
                ventures={ventures}
                onSelectVenture={handleSelectVenture}
                onNavigate={handleNavigate}
              />
            )}

            {activePage === 'venture-detail' && selectedVenture && (
              <VentureDetailPage
                venture={selectedVenture}
                allVentures={ventures}
                autoFocusTour={autoFocusTour}
                onBackToVentures={() => handleNavigate('ventures')}
                onUpdateCustomPanorama={handleUpdateCustomPanorama}
              />
            )}

            {activePage === 'admin' && (
              <AdminPortalPage
                ventures={ventures}
                onSaveVenture={handleSaveVenture}
                onCreateVenture={handleCreateVenture}
                onResetAll={handleResetAll}
                onBackToVentures={() => handleNavigate('ventures')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer
        ventures={ventures}
        onNavigate={handleNavigate}
        onSelectVenture={(id) => handleSelectVenture(id, false)}
      />
    </div>
  );
}
