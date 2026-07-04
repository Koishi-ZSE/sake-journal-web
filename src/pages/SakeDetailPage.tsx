import React, { useState } from 'react';
import { ArrowLeft, Star, Camera, X, Pencil } from 'lucide-react';
import { SakeItem } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface SakeDetailPageProps {
  sake: SakeItem;
  onBack: () => void;
  onUpdateImage?: (id: string, imageUrl: string) => void;
  onEdit?: () => void;
}

// 雷達圖元件（純 SVG，不需要外部套件）
function RadarChart({ sake }: { sake: SakeItem }) {
  const axes = [
    { key: 'aroma', label: '香氣', value: sake.aroma },
    { key: 'sweetness', label: '甜度', value: sake.sweetness },
    { key: 'complexity', label: '層次', value: sake.complexity },
    { key: 'tasteScore', label: '酒味', value: sake.tasteScore },
    { key: 'smoothness', label: '順口', value: sake.smoothness },
  ];

  // 若全部為 null 則不顯示
  if (axes.every((a) => a.value == null)) return null;

  const n = axes.length;
  const cx = 110;
  const cy = 110;
  const maxR = 80;
  const maxVal = 5;

  // 計算各軸角度（從頂部開始，順時針）
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, r: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // 背景網格（5層）
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map((level) => {
    const r = (level / maxVal) * maxR;
    const points = axes.map((_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    });
    return points.join(' ');
  });

  // 資料多邊形
  const dataPoints = axes.map((axis, i) => {
    const val = axis.value ?? 0;
    const r = (val / maxVal) * maxR;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // 標籤位置（稍微往外推）
  const labelR = maxR + 22;

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* 背景網格 */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke={i === 4 ? '#4b5563' : '#374151'}
            strokeWidth={i === 4 ? 1.5 : 0.8}
          />
        ))}
        {/* 軸線 */}
        {axes.map((_, i) => {
          const outer = getPoint(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="#4b5563"
              strokeWidth={0.8}
            />
          );
        })}
        {/* 資料填充 */}
        <polygon
          points={dataPolygon}
          fill="rgba(251,191,36,0.15)"
          stroke="#f59e0b"
          strokeWidth={2}
        />
        {/* 資料點 */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#f59e0b" />
        ))}
        {/* 標籤 */}
        {axes.map((axis, i) => {
          const lp = getPoint(i, labelR);
          const val = axis.value;
          return (
            <g key={i}>
              <text
                x={lp.x}
                y={lp.y - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#9ca3af"
                fontSize="10"
              >
                {axis.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={val != null ? '#fbbf24' : '#4b5563'}
                fontSize="11"
                fontWeight="bold"
              >
                {val != null ? Number(val).toFixed(1) : '—'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 酒體分類顏色對應
const bodyTypeColors: Record<string, string> = {
  '薰': 'bg-pink-900/60 text-pink-300 border-pink-700/50',
  '爽': 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50',
  '醇': 'bg-orange-900/60 text-orange-300 border-orange-700/50',
  '熟': 'bg-amber-900/60 text-amber-300 border-amber-700/50',
};

export function SakeDetailPage({ sake, onBack, onUpdateImage, onEdit }: SakeDetailPageProps) {
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(sake.imageUrl || '');
  const displayRice = sake.riceParsed || sake.rice;

  const handleUploadComplete = (url: string) => {
    setCurrentImageUrl(url);
    if (onUpdateImage) onUpdateImage(sake.id, url);
    setTimeout(() => setShowPhotoEditor(false), 1500);
  };

  const bodyTypeClass = sake.bodyType
    ? (bodyTypeColors[sake.bodyType] || 'bg-gray-800 text-gray-300 border-gray-600')
    : '';

  return (
    <>
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 頂部列：返回 + 編輯按鈕 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-gray-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-gray-700"
        >
          <ArrowLeft size={18} />
          返回
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Pencil size={15} />
            編輯資訊
          </button>
        )}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* 圖片區域 */}
        <div className="relative">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={sake.name}
              className="w-full h-80 object-cover cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
              title="點擊查看完整照片"
            />
          ) : (
            <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
              <p className="text-gray-600 text-sm">尚無照片</p>
            </div>
          )}
          {onEdit && (
            <button
              onClick={() => setShowPhotoEditor(!showPhotoEditor)}
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-lg text-sm transition-all border border-white/20"
            >
              <Camera size={15} />
              {currentImageUrl ? '替換照片' : '新增照片'}
            </button>
          )}
        </div>

        {/* 照片上傳面板 */}
        {showPhotoEditor && (
          <div className="border-b border-gray-700 bg-gray-950 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">
                {currentImageUrl ? '替換照片' : '新增照片'}
              </h3>
              <button onClick={() => setShowPhotoEditor(false)} className="text-gray-500 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <ImageUploader currentImageUrl={currentImageUrl} onUploadComplete={handleUploadComplete} />
          </div>
        )}

        <div className="p-6">
          {/* 標題 + 評分 */}
          <div className="mb-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-100 leading-tight">{sake.name}</h1>
              {sake.rating && (
                <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/50 px-4 py-2 rounded-xl flex-shrink-0">
                  <Star className="fill-amber-400 text-amber-400" size={20} />
                  <span className="text-xl font-bold text-amber-400">{Number(sake.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
            {sake.brewery && <p className="text-lg text-gray-400">{sake.brewery}</p>}
            {sake.prefecture && <p className="text-sm text-gray-500 mt-0.5">{sake.prefecture}</p>}
          </div>

          {/* 標籤列 */}
          <div className="mb-6 flex flex-wrap gap-2">
            {sake.bodyType && (
              <span className={`border px-3 py-1 rounded-full text-sm font-semibold ${bodyTypeClass}`}>
                {sake.bodyType}
              </span>
            )}
            {sake.type && (
              <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-3 py-1 rounded-full text-sm">
                {sake.type}
              </span>
            )}
            {sake.flavor && (
              <span className="bg-purple-900/60 text-purple-300 border border-purple-700/50 px-3 py-1 rounded-full text-sm">
                {sake.flavor}
              </span>
            )}
            {displayRice && (
              <span className="bg-green-900/60 text-green-300 border border-green-700/50 px-3 py-1 rounded-full text-sm">
                {displayRice}
              </span>
            )}
            {sake.seimai && (
              <span className="bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 px-3 py-1 rounded-full text-sm">
                精米 {sake.seimai}
              </span>
            )}
            {sake.brewingNote && (
              <span className="bg-teal-900/60 text-teal-300 border border-teal-700/50 px-3 py-1 rounded-full text-sm">
                {sake.brewingNote}
              </span>
            )}
          </div>

          {/* 雷達圖 + 基本資訊並排 */}
          <div className="flex flex-col md:flex-row gap-6 mb-6 pb-6 border-b border-gray-700">
            {/* 雷達圖 */}
            {(sake.aroma != null || sake.smoothness != null || sake.tasteScore != null ||
              sake.complexity != null || sake.sweetness != null) && (
              <div className="flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2 text-center">風味雷達</p>
                <RadarChart sake={sake} />
              </div>
            )}

            {/* 詳細資訊格 */}
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4 content-start">
              {sake.alcoholContent && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">酒精濃度</p>
                  <p className="text-base font-semibold text-gray-200">{sake.alcoholContent}</p>
                </div>
              )}
              {sake.sakeLevel && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">日本酒度</p>
                  <p className="text-base font-semibold text-gray-200">{sake.sakeLevel}</p>
                </div>
              )}
              {sake.yeast && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">酵母</p>
                  <p className="text-base font-semibold text-gray-200 whitespace-pre-wrap">{sake.yeast}</p>
                </div>
              )}
              {sake.otherNote && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">其他備註</p>
                  <p className="text-base font-semibold text-gray-200">{sake.otherNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* 說明（品飲筆記） */}
          {sake.description && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">品飲筆記</p>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{sake.description}</p>
            </div>
          )}

          {/* 舊版 notes 欄位（向下相容） */}
          {sake.notes && !sake.description && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">品飲筆記</p>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">{sake.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Lightbox 全螢幕照片檢視 - 在同一個 return 內 */}
    {showLightbox && currentImageUrl && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        onClick={() => setShowLightbox(false)}
      >
        {/* 關閉按鈕 */}
        <button
          onClick={() => setShowLightbox(false)}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full border border-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        {/* 完整照片（點擊背景關閉，點擊圖片不關閉） */}
        <img
          src={currentImageUrl}
          alt={sake.name}
          className="max-w-full max-h-full object-contain select-none"
          style={{ maxWidth: '100vw', maxHeight: '100vh' }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  );
}
