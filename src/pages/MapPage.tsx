import React, { useState, useMemo } from 'react';
import { SakeItem } from '../types';

interface MapPageProps {
  allSake: SakeItem[];
  onSakeClick: (sakeId: string) => void;
}

// 日本地圖圖片尺寸：2000x2000px
// 以下座標為各縣市中心點在 2000x2000 圖片上的像素位置（x, y）
// 圖片左上角為 (0,0)，右下角為 (2000,2000)
const PREFECTURE_POSITIONS: Record<string, { x: number; y: number }> = {
  // 北海道・東北
  '北海道': { x: 1480, y: 220 },
  '青森': { x: 1230, y: 490 },
  '岩手': { x: 1280, y: 590 },
  '秋田': { x: 1160, y: 570 },
  '宮城': { x: 1300, y: 660 },
  '山形': { x: 1190, y: 650 },
  '福島': { x: 1240, y: 730 },
  // 関東
  '茨城': { x: 1310, y: 800 },
  '栃木': { x: 1240, y: 790 },
  '群馬': { x: 1190, y: 790 },
  '埼玉': { x: 1240, y: 830 },
  '千葉': { x: 1320, y: 850 },
  // 甲信越・北陸
  '新潟': { x: 1160, y: 720 },
  '富山': { x: 1090, y: 760 },
  '石川': { x: 1040, y: 770 },
  '福井': { x: 1020, y: 800 },
  '山梨': { x: 1200, y: 840 },
  '長野': { x: 1160, y: 810 },
  // 東海
  '愛知': { x: 1120, y: 870 },
  '三重': { x: 1100, y: 900 },
  // 近畿
  '滋賀': { x: 1050, y: 855 },
  '京都': { x: 1020, y: 860 },
  '奈良': { x: 1050, y: 890 },
  '和歌山': { x: 1030, y: 930 },
  // 中国
  '山口': { x: 870, y: 940 },
  '廣島': { x: 920, y: 920 },
  // 四国
  '愛媛': { x: 930, y: 980 },
  '高知': { x: 980, y: 1010 },
  // 九州
  '福岡': { x: 820, y: 1000 },
  '佐賀': { x: 790, y: 1020 },
  '長崎': { x: 760, y: 1040 },
  '熊本': { x: 840, y: 1060 },
  '大分': { x: 900, y: 1030 },
};

// 由北到南的縣市順序（用於按鈕排列）
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
];

// 日本地圖底圖 URL（Cloudinary，淺灰色 CSS filter）
const MAP_IMAGE_URL = 'https://res.cloudinary.com/lyuww36c/image/upload/v1783097960/japan_map_base.png';

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

      {/* 地圖區域 */}
      <div className="relative mx-4 mb-3 rounded-2xl overflow-hidden bg-gray-900" style={{ aspectRatio: '1/1' }}>
        {/* 底圖（淺灰色） */}
        <img
          src={MAP_IMAGE_URL}
          alt="日本地圖"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: 'brightness(0) invert(1) opacity(0.15)' }}
        />

        {/* 縣市圓點 */}
        {availablePrefectures.map((pref) => {
          const pos = PREFECTURE_POSITIONS[pref];
          if (!pos) return null;
          const count = countByPrefecture[pref] || 0;
          const isSelected = selectedPrefecture === pref;
          // 將 2000x2000 座標轉換為百分比
          const xPct = (pos.x / 2000) * 100;
          const yPct = (pos.y / 2000) * 100;

          return (
            <button
              key={pref}
              onClick={() => handlePrefectureClick(pref)}
              style={{
                position: 'absolute',
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="flex flex-col items-center group"
            >
              {/* 圓點 */}
              <div
                className={`rounded-full flex items-center justify-center font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-gray-900 shadow-lg shadow-amber-400/50'
                    : 'bg-amber-600/80 text-white hover:bg-amber-400 hover:text-gray-900'
                }`}
                style={{
                  width: isSelected ? 28 : 22,
                  height: isSelected ? 28 : 22,
                  fontSize: isSelected ? 10 : 9,
                }}
              >
                {count}
              </div>
              {/* 縣市名稱（選中時顯示） */}
              {isSelected && (
                <div className="absolute -bottom-5 whitespace-nowrap text-xs font-bold text-amber-400 bg-gray-900/90 px-1 rounded">
                  {pref}
                </div>
              )}
            </button>
          );
        })}
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
          點擊地圖上的圓點或下方按鈕查看酒款
        </div>
      )}
    </div>
  );
}
