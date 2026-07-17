import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Home, BarChart3, Map, Settings, PenLine, X } from 'lucide-react';
import { useSakeData } from './hooks/useSakeData';
import { HomePage } from './pages/HomePage';
import { RankingPage } from './pages/RankingPage';
import { MapPage } from './pages/MapPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddSakePage } from './pages/AddSakePage';
import { SakeDetailPage } from './pages/SakeDetailPage';
import { EditSakePage } from './pages/EditSakePage';
import { EditListPage } from './pages/EditListPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PasswordModal } from './components/PasswordModal';

type PageType = 'home' | 'ranking' | 'map' | 'editlist' | 'settings' | 'add' | 'detail' | 'edit';

function AppInner() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedSakeId, setSelectedSakeId] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<PageType>('home');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const scrollToSakeIdRef = useRef<string | null>(null);
  const { allSake, isLoading, addCustomSake, updateSakeImage, updateSake, deleteSake } = useSakeData();
  const { isEditor, requestEdit } = useAuth();

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<PageType, number>>>({});

  const navigateTo = useCallback((newPage: PageType, options?: { resetScroll?: boolean }) => {
    if (scrollRef.current) {
      scrollPositions.current[currentPage] = scrollRef.current.scrollTop;
    }
    if (options?.resetScroll) {
      delete scrollPositions.current[newPage];
    }
    setCurrentPage(newPage);
  }, [currentPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (currentPage === 'editlist' && scrollToSakeIdRef.current) {
      const targetId = scrollToSakeIdRef.current;
      scrollToSakeIdRef.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(`editlist-sake-${targetId}`);
          if (target) {
            target.scrollIntoView({ block: 'center' });
          } else {
            requestAnimationFrame(() => {
              const t2 = document.getElementById(`editlist-sake-${targetId}`);
              if (t2) t2.scrollIntoView({ block: 'center' });
            });
          }
        });
      });
      return;
    }

    const saved = scrollPositions.current[currentPage];
    requestAnimationFrame(() => {
      el.scrollTop = saved ?? 0;
    });
  }, [currentPage]);

  const handleSakeClick = (sakeId: string) => {
    setPrevPage(currentPage);
    setSelectedSakeId(sakeId);
    navigateTo('detail', { resetScroll: true });
  };

  const handleAddSake = async (sakeData: any) => {
    const newSake = await addCustomSake(sakeData);
    if (newSake?.id) {
      setPrevPage('home');
      setSelectedSakeId(newSake.id);
      navigateTo('detail', { resetScroll: true });
    } else {
      navigateTo('home');
    }
  };

  const handleEditSake = async (id: string, updates: any) => {
    await updateSake(id, updates);
    const backTo = prevPage === 'editlist' ? 'editlist' : 'home';
    setPrevPage(backTo);
    if (backTo === 'editlist') scrollToSakeIdRef.current = id;
    setSelectedSakeId(id);
    navigateTo('detail', { resetScroll: true });
  };

  const handleDeleteSake = async (id: string) => {
    await deleteSake(id);
    setSelectedSakeId(null);
    navigateTo('editlist', { resetScroll: false });
  };

  const handleBack = () => {
    navigateTo(prevPage);
  };

  const handleGoEdit = () => {
    setPrevPage('detail');
    navigateTo('edit', { resetScroll: true });
  };

  const handleNavClick = (page: PageType) => {
    if (page === 'editlist') {
      requestEdit(() => navigateTo('editlist'));
    } else {
      navigateTo(page);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400">載入中...</p>
        </div>
      </div>
    );
  }

  const selectedSake = selectedSakeId ? allSake.find((s) => s.id === selectedSakeId) : null;

  const navTabs = [
    { id: 'home', icon: Home, label: '首頁' },
    { id: 'ranking', icon: BarChart3, label: '排行榜' },
    { id: 'map', icon: Map, label: '地圖' },
    { id: 'editlist', icon: PenLine, label: '編輯' },
    { id: 'settings', icon: Settings, label: '設定' },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-black" style={{ isolation: 'isolate' }}>
      <PasswordModal />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {currentPage === 'home' && <HomePage allSake={allSake} onSakeClick={handleSakeClick} />}
        {currentPage === 'ranking' && <RankingPage allSake={allSake} onSakeClick={handleSakeClick} />}
        {currentPage === 'map' && <MapPage allSake={allSake} onSakeClick={handleSakeClick} />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'editlist' && (
          <EditListPage
            allSake={allSake}
            onSelectSake={(id) => {
              setPrevPage('editlist');
              setSelectedSakeId(id);
              scrollToSakeIdRef.current = id;
              delete scrollPositions.current['edit'];
              setCurrentPage('edit');
            }}
            onAdd={() => navigateTo('add', { resetScroll: true })}
          />
        )}
        {currentPage === 'add' && (
          <AddSakePage
            onAdd={handleAddSake}
            allSake={allSake}
            onCancel={() => navigateTo('home')}
          />
        )}
        {currentPage === 'detail' && selectedSake && (
          <SakeDetailPage
            sake={selectedSake}
            onBack={handleBack}
            onUpdateImage={updateSakeImage}
            onEdit={isEditor ? handleGoEdit : undefined}
            onOpenLightbox={(url) => setLightboxUrl(url)}
          />
        )}
        {currentPage === 'edit' && selectedSake && (
          <EditSakePage
            sake={selectedSake}
            allSake={allSake}
            onSave={handleEditSake}
            onDelete={handleDeleteSake}
            onBack={() => navigateTo(prevPage === 'editlist' ? 'editlist' : 'detail')}
          />
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black"
          style={{ zIndex: 9999 }}
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 flex items-center justify-center w-11 h-11 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full border border-gray-600 transition-colors"
            style={{ zIndex: 10000 }}
          >
            <X size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="完整照片"
            className="select-none"
            style={{ maxWidth: '100vw', maxHeight: '100dvh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <nav className="bg-gray-950 border-t border-gray-800 sticky bottom-0">
        <div className="flex justify-around max-w-4xl mx-auto">
          {navTabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id as PageType)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                currentPage === id
                  ? 'text-amber-400 border-t-2 border-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
