import React, { useState } from 'react';
import { SakeItem } from '../types';

interface MapPageProps {
  allSake: SakeItem[];
  onSakeClick: (sake: SakeItem) => void;
}

// 日本各縣市的大致座標（緯度、經度）
const prefectureCoords: Record<string, { lat: number; lng: number }> = {
  '北海道': { lat: 43.06, lng: 141.35 },
  '青森': { lat: 40.82, lng: 140.74 },
  '岩手': { lat: 39.70, lng: 141.15 },
  '宮城': { lat: 38.27, lng: 140.87 },
  '秋田': { lat: 39.72, lng: 140.10 },
  '山形': { lat: 38.24, lng: 140.36 },
  '福島': { lat: 37.75, lng: 140.47 },
  '茨城': { lat: 36.34, lng: 140.45 },
  '栃木': { lat: 36.57, lng: 139.88 },
  '群馬': { lat: 36.39, lng: 139.06 },
  '埼玉': { lat: 35.86, lng: 139.65 },
  '千葉': { lat: 35.61, lng: 140.12 },
  '東京': { lat: 35.69, lng: 139.69 },
  '神奈川': { lat: 35.45, lng: 139.64 },
  '新潟': { lat: 37.90, lng: 139.02 },
  '富山': { lat: 36.70, lng: 137.21 },
  '石川': { lat: 36.59, lng: 136.63 },
  '福井': { lat: 36.07, lng: 136.22 },
  '山梨': { lat: 35.66, lng: 138.57 },
  '長野': { lat: 36.65, lng: 138.18 },
  '岐阜': { lat: 35.39, lng: 136.72 },
  '静岡': { lat: 34.98, lng: 138.38 },
  '愛知': { lat: 35.18, lng: 136.91 },
  '三重': { lat: 34.73, lng: 136.51 },
  '滋賀': { lat: 35.00, lng: 135.87 },
  '京都': { lat: 35.02, lng: 135.76 },
  '大阪': { lat: 34.69, lng: 135.50 },
  '兵庫': { lat: 34.69, lng: 135.18 },
  '奈良': { lat: 34.69, lng: 135.83 },
  '和歌山': { lat: 34.23, lng: 135.17 },
  '鳥取': { lat: 35.50, lng: 134.24 },
  '島根': { lat: 35.47, lng: 133.05 },
  '岡山': { lat: 34.66, lng: 133.93 },
  '広島': { lat: 34.40, lng: 132.46 },
  '山口': { lat: 34.19, lng: 131.47 },
  '徳島': { lat: 34.07, lng: 134.56 },
  '香川': { lat: 34.34, lng: 134.04 },
  '愛媛': { lat: 33.84, lng: 132.77 },
  '高知': { lat: 33.56, lng: 133.53 },
  '福岡': { lat: 33.61, lng: 130.42 },
  '佐賀': { lat: 33.25, lng: 130.30 },
  '長崎': { lat: 32.74, lng: 129.87 },
  '熊本': { lat: 32.79, lng: 130.74 },
  '大分': { lat: 33.24, lng: 131.61 },
  '宮崎': { lat: 31.91, lng: 131.42 },
  '鹿児島': { lat: 31.56, lng: 130.56 },
  '沖縄': { lat: 26.21, lng: 127.68 },
};

export function MapPage({ allSake, onSakeClick }: MapPageProps) {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);

  // 按縣市分組
  const byPrefecture = allSake.reduce<Record<string, SakeItem[]>>((acc, sake) => {
    const pref = sake.prefecture || '不明';
    if (!acc[pref]) acc[pref] = [];
    acc[pref].push(sake);
    return acc;
  }, {});

  const prefectures = Object.keys(byPrefecture).sort();
  const selectedSakes = selectedPref ? byPrefecture[selectedPref] || [] : [];

  // 計算地圖範圍
  const minLat = 30, maxLat = 45, minLng = 129, maxLng = 146;
  const mapWidth = 320, mapHeight = 400;

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * mapWidth;
  const toY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold text-amber-400 mb-4">產地地圖</h1>

        {/* 地圖區域 */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4 overflow-x-auto">
          <svg width={mapWidth} height={mapHeight} className="mx-auto">
            {/* 背景 */}
            <rect width={mapWidth} height={mapHeight} fill="#1e293b" rx="8" />

            {/* 各縣市的點 */}
            {prefectures.map((pref) => {
              const coords = prefectureCoords[pref];
              if (!coords) return null;
              const x = toX(coords.lng);
              const y = toY(coords.lat);
              const count = byPrefecture[pref].length;
              const isSelected = selectedPref === pref;
              const radius = Math.min(4 + count * 1.5, 16);

              return (
                <g key={pref} onClick={() => setSelectedPref(isSelected ? null : pref)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={isSelected ? '#f59e0b' : '#3b82f6'}
                    opacity={0.85}
                    stroke={isSelected ? '#fbbf24' : '#60a5fa'}
                    strokeWidth={1.5}
                  />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-center text-gray-400 text-xs mt-2">點擊圓點查看該縣市的酒款</p>
        </div>

        {/* 縣市列表 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {prefectures.map((pref) => (
            <button
              key={pref}
              onClick={() => setSelectedPref(selectedPref === pref ? null : pref)}
              className={`text-sm py-2 px-3 rounded-lg text-left transition-colors ${
                selectedPref === pref
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{pref}</span>
              <span className="ml-1 text-xs opacity-70">({byPrefecture[pref].length})</span>
            </button>
          ))}
        </div>

        {/* 選中縣市的酒款列表 */}
        {selectedPref && (
          <div>
            <h2 className="text-lg font-bold text-amber-400 mb-3">
              {selectedPref}（{selectedSakes.length} 款）
            </h2>
            <div className="space-y-2">
              {selectedSakes.map((sake) => (
                <button
                  key={sake.id}
                  onClick={() => onSakeClick(sake)}
                  className="w-full bg-gray-800 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-700 transition-colors text-left"
                >
                  {sake.imageUrl ? (
                    <img src={sake.imageUrl} alt={sake.name} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">🍶</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{sake.name}</p>
                    <p className="text-sm text-gray-400 truncate">{sake.brewery}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-400 text-xs">★ {sake.rating}</span>
                      {sake.type && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{sake.type}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
