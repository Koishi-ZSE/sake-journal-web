import React from 'react';
import { Moon, Info, Database, BookOpen, Lock, Unlock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { isEditor, requestEdit, logout } = useAuth();

  const handleClearData = () => {
    if (window.confirm('確定要清除所有自訂酒款及編輯記錄嗎？此操作無法復原。')) {
      localStorage.removeItem('sake_journal_custom_sake');
      localStorage.removeItem('sake_journal_image_overrides');
      localStorage.removeItem('sake_journal_field_overrides');
      window.location.reload();
    }
  };

  const handleClearEdits = () => {
    if (window.confirm('確定要清除所有對原始酒款的編輯記錄嗎？自訂酒款不受影響。')) {
      localStorage.removeItem('sake_journal_image_overrides');
      localStorage.removeItem('sake_journal_field_overrides');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">設定</h1>
      </div>

      <div className="space-y-4">
        {/* 編輯者狀態 */}
        <div className={`rounded-xl border p-4 ${isEditor ? 'bg-amber-900/20 border-amber-700/50' : 'bg-gray-900 border-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditor
                ? <Unlock className="text-amber-400" size={22} />
                : <Lock className="text-gray-500" size={22} />
              }
              <div>
                <p className="font-semibold text-gray-100">
                  {isEditor ? '編輯模式已啟用' : '訪客模式'}
                </p>
                <p className="text-sm text-gray-400">
                  {isEditor
                    ? '您可以新增、編輯所有酒款資訊'
                    : '點擊右側按鈕輸入密碼以進入編輯模式'
                  }
                </p>
              </div>
            </div>
            {isEditor ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-600"
              >
                <LogOut size={15} />
                登出
              </button>
            ) : (
              <button
                onClick={() => requestEdit(() => {})}
                className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <Lock size={15} />
                登入
              </button>
            )}
          </div>
        </div>

        {/* 主題說明 */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Moon className="text-amber-400" size={22} />
            <div>
              <p className="font-semibold text-gray-100">深色模式</p>
              <p className="text-sm text-gray-400">目前使用深色主題，呈現高級質感</p>
            </div>
          </div>
        </div>

        {/* 關於 */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-amber-400" />
            <h3 className="font-semibold text-gray-100">關於</h3>
          </div>
          <div className="space-y-1.5 text-sm text-gray-400">
            <p><span className="text-gray-300 font-medium">應用程式名稱：</span>koshi_sake journal</p>
            <p><span className="text-gray-300 font-medium">版本：</span>1.0.0</p>
            <p><span className="text-gray-300 font-medium">描述：</span>日本酒品飲紀錄應用程式</p>
          </div>
        </div>

        {/* 資料管理 */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={18} className="text-amber-400" />
            <h3 className="font-semibold text-gray-100">資料管理</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            您的自訂酒款與編輯記錄儲存在本地瀏覽器中。
          </p>
          <div className="space-y-2">
            <button
              onClick={handleClearEdits}
              className="w-full bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700/50 text-yellow-300 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              清除原始酒款的編輯記錄
            </button>
            <button
              onClick={handleClearData}
              className="w-full bg-red-900/50 hover:bg-red-800/70 border border-red-700/60 text-red-300 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              清除所有資料（含自訂酒款）
            </button>
          </div>
        </div>

        {/* 使用說明 */}
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-amber-400" />
            <h3 className="font-semibold text-gray-100">使用說明</h3>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { title: '首頁', desc: '瀏覽所有酒款，使用搜尋和篩選功能找到您喜歡的酒。' },
              { title: '排行榜', desc: '查看您評分最高的 Top 20 酒款。' },
              { title: '地圖', desc: '按縣市瀏覽酒款，了解各地的特色酒品。' },
              { title: '新增', desc: '記錄您品嚐過的自訂酒款（需要編輯密碼）。' },
              { title: '編輯酒款', desc: '進入任一酒款詳細頁面，輸入密碼後點擊「編輯資訊」即可修改。' },
            ].map(({ title, desc }) => (
              <div key={title}>
                <p className="font-semibold text-gray-200">{title}</p>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
