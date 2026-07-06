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
  // 返回 editlist 時要滾動到的酒款 id（用 ref 避免觸發額外 render）
  const scrollToSakeIdRef = useRef<string | null>(null);
  const { allSake, isLoading, addCustomSake, updateSakeImage, updateSake } = useSakeData();
  const { isEditor, requestEdit } = useAuth();

  // 記錄各頁面的滾動位置，切換頁面時恢復
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositions = useRef<Partial<Record<PageType, number>>>({});

  // 切換頁面時：先儲存目前頁的 scrollTop，再切換
  const navigateTo = useCallback((newPage: PageType, options?: { resetScroll?: boolean }) => {
    if (scrollRef.current) {
      scrollPositions.current[currentPage] = scrollRef.current.scrollTop;
    }
    if (options?.resetScroll) {
      // 新頁面從頂部開始
      delete scrollPositions.current[newPage];
    }
    setCurrentPage(newPage);
  }, [currentPage]);

  // 頁面切換後恢復滾動位置
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 如果有指定要滾動到的酒款，用 scrollIntoView 精確定位
    if (currentPage === 'editlist' && scrollToSakeIdRef.current) {
      const targetId = scrollToSakeIdRef.current;
      scrollToSakeIdRef.current = null;
      // 等 DOM 渲染完成後再滾動（兩層 rAF 確保 list 已完整渲染）
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const target = document.getElementById(`editlist-sake-${targetId}`);
          if (target) {
            target.scrollIntoView({ block: 'center' });
          } else {
            // fallback：DOM 還沒好，再等一個 frame
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
    // 新增後跳轉到該酒款的詳細頁
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
    // 儲存後跳轉到該酒款的詳細頁
    // prevPage 設為編輯前的來源頁（editlist 或 home），讓詳細頁返回可以回到正確位置
    const backTo = prevPage === 'editlist' ? 'editlist' : 'home';
    setPrevPage(backTo);
    // 儲存後返回詳細頁，再從詳細頁返回 editlist 時要滾動到該酒款
    if (backTo === 'editlist') scrollToSakeIdRef.current = id;
    setSelectedSakeId(id);
    navigateTo('detail', { resetScroll: true });
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

  // 底部導航 tabs（編輯模式下才顯示「編輯」tab）
  const navTabs = [
    { id: 'home', icon: Home, label: '首頁' },
    { id: 'ranking', icon: BarChart3, label: '排行榜' },
    { id: 'map', icon: Map, label: '地圖' },
    { id: 'editlist', icon: PenLine, label: '編輯' },
    { id: 'settings', icon: Settings, label: '設定' },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-black" style={{ isolation: 'isolate' }}>
      {/* 密碼輸入 Modal */}
      <PasswordModal />

      {/* 主內容區域 */}
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
              // 記錄要滾動到的酒款 id，返回時用 scrollIntoView 定位
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
            onBack={() => navigateTo(prevPage === 'editlist' ? 'editlist' : 'detail')}
          />
        )}
      </div>

      {/* Lightbox：渲染在最外層，不受 overflow-y-auto 影響 */}
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

      {/* 底部導航欄 */}
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
