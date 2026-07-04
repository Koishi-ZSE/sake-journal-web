import React, { useState } from 'react';
import { SakeItem } from '../types';
import { Star } from 'lucide-react';

interface SakeCardProps {
  sake: SakeItem;
  onClick?: () => void;
}

export function SakeCard({ sake, onClick }: SakeCardProps) {
  const displayRice = sake.riceParsed || sake.rice;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = sake.imageUrl && !imgError;
  const showPlaceholder = !sake.imageUrl || imgError || !imgLoaded;

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-700 rounded-xl cursor-pointer hover:border-amber-500 hover:shadow-lg hover:shadow-amber-900/20 transition-all overflow-hidden flex h-36"
    >
      {/* 左側：直向照片（固定寬度，object-position: center 自動置中酒瓶） */}
      <div className="w-28 flex-shrink-0 relative overflow-hidden bg-gray-800">
        {/* 佔位符：圖片載入完成前始終顯示 */}
        {showPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl opacity-30">🍶</span>
          </div>
        )}
        {/* 圖片：載入完成後才顯示 */}
        {showImage && (
          <img
            src={sake.imageUrl}
            alt={sake.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s ease' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* 右側：文字在上，標籤在下 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        {/* 上方：酒名 + 評分 */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-100 leading-tight line-clamp-2 flex-1">
              {sake.name}
            </h3>
            {sake.rating && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">{Number(sake.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
          {sake.brewery && (
            <p className="text-xs text-gray-400 leading-tight truncate">{sake.brewery}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">{sake.prefecture}</p>
        </div>

        {/* 下方：標籤 */}
        <div className="flex flex-wrap gap-1 mt-1">
          {sake.type && (
            <span className="inline-block bg-blue-900/60 text-blue-300 text-xs px-1.5 py-0.5 rounded border border-blue-700/50 leading-tight">
              {sake.type}
            </span>
          )}
          {displayRice && (
            <span className="inline-block bg-green-900/60 text-green-300 text-xs px-1.5 py-0.5 rounded border border-green-700/50 leading-tight">
              {displayRice}
            </span>
          )}
          {sake.seimai && (
            <span className="inline-block bg-yellow-900/60 text-yellow-300 text-xs px-1.5 py-0.5 rounded border border-yellow-700/50 leading-tight">
              精米 {sake.seimai}
            </span>
          )}
          {sake.flavor && (
            <span className="inline-block bg-purple-900/60 text-purple-300 text-xs px-1.5 py-0.5 rounded border border-purple-700/50 leading-tight">
              {sake.flavor}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
