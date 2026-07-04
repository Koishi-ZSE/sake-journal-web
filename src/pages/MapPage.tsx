import React, { useState, useMemo } from 'react';
import { SakeItem } from '../types';

interface MapPageProps {
  allSake: SakeItem[];
  onSakeClick: (sakeId: string) => void;
}

// 由北到南的縣市順序（不帶後綴，與 sake-data.json 一致）
const PREFECTURE_ORDER = [
  '北海道',
  '青森', '岩手', '秋田',
  '宮城', '山形', '福島',
  '茨城', '栃木', '群馬',
  '埼玉', '千葉',
  '新潟', '富山', '石川',
  '福井', '山梨', '長野',
  '愛知', '三重',
  '滋賀', '京都', '奈良',
  '和歌山',
  '山口', '廣島',
  '愛媛', '高知',
  '福岡', '佐賀', '長崎',
  '熊本', '大分',
  '宮崎', '鹿児島', '沖縄',
  '東京', '大阪', '神奈川', '兵庫',
];

// 日本地圖底圖 URL（Cloudinary，深色背景 + 淺灰色陸地）
const MAP_IMAGE_URL = 'https://res.cloudinary.com/lyuww36c/image/upload/v1783099664/japan_map_dark.png';

export function MapPage({ allSake, onSakeClick }: MapPageProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  // 取得資料中實際存在的縣市
  const availablePrefectures = useMemo(() => {
    const set = new Set(allSake.map((s) => s.prefecture).filter(Boolean));
    return PREFECTURE_ORDER.filter((p) => set.has(p));
  }, [allSake]);

  // 各縣市的酒款數量
  const countByPrefecture = useMemo(() => {
    const map: Record<string, number> = {};
    allSake.forEach((s) => {
      if (s.prefecture) map[s.prefecture] = (map[s.prefecture] || 0) + 1;
    });
    return map;
  }, [allSake]);

  // 選中縣市的酒款
  const selectedSakes = useMemo(() => {
    if (!selectedPrefecture) return [];
    return allSake.filter((s) => s.prefecture === selectedPrefecture);
  }, [allSake, selectedPrefecture]);

  const handlePrefectureClick = (pref: string) => {
    setSelectedPrefecture(pref === selectedPrefecture ? null : pref);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white">
      {/* 標題 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-amber-400">產地地圖</h1>
        <p className="text-xs text-gray-400 mt-0.5">{allSake.length} 款 · {availablePrefectures.length} 個產地</p>
      </div>

      {/* 地圖區域（純底圖，無圓點） */}
      <div className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-[#0f172a]" style={{ aspectRatio: '1/1' }}>
        <img
          src={MAP_IMAGE_URL}
          alt="日本地圖"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* 縣市按鈕列（由北到南，由左至右） */}
      <div className="px-4 mb-3">
        <div className="flex flex-wrap gap-2">
          {availablePrefectures.map((pref) => {
            const count = countByPrefecture[pref] || 0;
            const isSelected = selectedPrefecture === pref;
            return (
              <button
                key={pref}
                onClick={() => handlePrefectureClick(pref)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {pref} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 選中縣市的酒款列表 */}
      {selectedPrefecture && (
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-2">
            {selectedPrefecture} · {selectedSakes.length} 款
          </h2>
          <div className="space-y-2">
            {selectedSakes.map((sake) => (
              <button
                key={sake.id}
                onClick={() => onSakeClick(sake.id)}
                className="w-full bg-gray-800 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left"
              >
                {sake.imageUrl ? (
                  <img
                    src={sake.imageUrl}
                    alt={sake.name}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-lg">
                    🍶
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{sake.name}</div>
                  <div className="text-xs text-gray-400 truncate">{sake.brewery}</div>
                  {sake.type && (
                    <div className="text-xs text-amber-500 mt-0.5">{sake.type}</div>
                  )}
                </div>
                {sake.rating && (
                  <div className="text-amber-400 text-sm font-bold flex-shrink-0">
                    ★ {sake.rating}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedPrefecture && (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm pb-8">
          點擊上方按鈕查看各產地酒款
        </div>
      )}
    </div>
  );
}
