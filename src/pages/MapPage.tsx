import React, { useState, useMemo } from 'react';
import { SakeItem } from '../types';
import { SakeCard } from '../components/SakeCard';

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
  '埼玉', '千葉', '東京', '神奈川',
  '新潟', '富山', '石川',
  '福井', '山梨', '長野', '岐阜',
  '静岡', '愛知', '三重',
  '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
  '鳥取', '島根', '岡山', '廣島', '山口',
  '徳島', '香川', '愛媛', '高知',
  '福岡', '佐賀', '長崎',
  '熊本', '大分', '宮崎', '鹿児島', '沖縄',
];

// 新地圖底圖：深色背景 + 淺灰陸地 + 白色縣市名稱
const MAP_IMAGE_URL = 'https://res.cloudinary.com/lyuww36c/image/upload/v1783135352/japan_map_labeled.png';

export function MapPage({ allSake, onSakeClick }: MapPageProps) {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);

  // 取得資料中實際存在的縣市
  const availablePrefectures = useMemo(() => {
    const set = new Set(allSake.map((s) => s.prefecture).filter(Boolean));
    const ordered = PREFECTURE_ORDER.filter((p) => set.has(p));
    set.forEach((p) => { if (p && !PREFECTURE_ORDER.includes(p)) ordered.push(p); });
    return ordered;
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
    // 使用正常文件流，讓外層容器的 overflow-y-auto 負責滾動
    <div className="min-h-full bg-gray-950 text-white pb-6">
      {/* 標題 */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-amber-400">產地地圖</h1>
        <p className="text-xs text-gray-400 mt-0.5">{allSake.length} 款 · {availablePrefectures.length} 個產地</p>
      </div>

      {/* 地圖區域（含縣市名稱標示） */}
      <div
        className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-[#0f172a]"
        style={{ aspectRatio: '4/3' }}
      >
        <img
          src={MAP_IMAGE_URL}
          alt="日本產地地圖"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* 縣市按鈕列（由北到南，由左至右） */}
      <div className="px-4 mb-4">
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

      {/* 選中縣市的酒款列表（SakeCard 完整卡片，隨頁面自然延伸） */}
      {selectedPrefecture && (
        <div className="px-4">
          <h2 className="text-sm font-semibold text-amber-400 mb-3">
            {selectedPrefecture} · {selectedSakes.length} 款
          </h2>
          <div className="flex flex-col gap-3">
            {selectedSakes.map((sake) => (
              <div key={sake.id} onClick={() => onSakeClick(sake.id)} className="cursor-pointer">
                <SakeCard sake={sake} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedPrefecture && (
        <div className="flex items-center justify-center text-gray-500 text-sm py-8">
          點擊上方按鈕查看各產地酒款
        </div>
      )}
    </div>
  );
}
