import React, { useState } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { SakeItem } from '../types';

interface RankingPageProps {
  allSake: SakeItem[];
  onSakeClick: (id: string) => void;
}

function RankingCard({
  sake,
  index,
  onClick,
}: {
  sake: SakeItem;
  index: number;
  onClick: () => void;
}) {
  const displayRice = sake.riceParsed || sake.rice;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = sake.imageUrl && !imgError;
  const showPlaceholder = !sake.imageUrl || imgError || !imgLoaded;

  const getRankIcon = () => {
    if (index === 0) return <Trophy className="text-yellow-400" size={20} />;
    if (index === 1) return <Medal className="text-gray-300" size={20} />;
    if (index === 2) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-sm font-bold text-gray-400">#{index + 1}</span>;
  };

  const getRankBg = () => {
    if (index === 0) return 'bg-yellow-900/20 border-yellow-700/40';
    if (index === 1) return 'bg-gray-800/60 border-gray-600/40';
    if (index === 2) return 'bg-amber-900/20 border-amber-700/40';
    return 'bg-gray-900 border-gray-700';
  };

  return (
    <div
      onClick={onClick}
      className={`flex rounded-xl border cursor-pointer hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-900/20 transition-all overflow-hidden h-36 ${getRankBg()}`}
    >
      {/* 左側：照片區塊 */}
      <div className="relative w-28 flex-shrink-0">
        {/* 佔位符：圖片載入完成前始終顯示 */}
        {showPlaceholder && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
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
        {/* 排名徽章疊在照片左上角 */}
        <div className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/70 border border-white/20 backdrop-blur-sm z-10">
          {getRankIcon()}
        </div>
      </div>

      {/* 右側資訊 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
        {/* 上方：酒名 + 評分 */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-100 leading-tight line-clamp-2 flex-1">
              {sake.name}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-base font-bold text-amber-400">{sake.rating != null ? Number(sake.rating).toFixed(1) : ''}</span>
            </div>
          </div>
          {sake.brewery && (
            <p className="text-xs text-gray-400 truncate">{sake.brewery}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">{sake.prefecture}</p>
        </div>

        {/* 下方：標籤 */}
        <div className="flex flex-wrap gap-1 mt-1">
          {sake.type && (
            <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 text-xs px-1.5 py-0.5 rounded leading-tight">
              {sake.type}
            </span>
          )}
          {displayRice && (
            <span className="bg-green-900/60 text-green-300 border border-green-700/50 text-xs px-1.5 py-0.5 rounded leading-tight">
              {displayRice}
            </span>
          )}
          {sake.seimai && (
            <span className="bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 text-xs px-1.5 py-0.5 rounded leading-tight">
              精米 {sake.seimai}
            </span>
          )}
          {sake.flavor && (
            <span className="bg-purple-900/60 text-purple-300 border border-purple-700/50 text-xs px-1.5 py-0.5 rounded leading-tight">
              {sake.flavor}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function RankingPage({ allSake, onSakeClick }: RankingPageProps) {
  const ranked = allSake
    .filter((sake) => sake.rating && sake.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 標題 */}
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="text-amber-400" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-amber-400">Top 20 排行榜</h1>
          <p className="text-gray-400 text-sm">依個人評分排序</p>
        </div>
      </div>

      {/* 排行榜列表 */}
      <div className="space-y-3">
        {ranked.length > 0 ? (
          ranked.map((sake, index) => (
            <RankingCard
              key={sake.id}
              sake={sake}
              index={index}
              onClick={() => onSakeClick(sake.id)}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-700">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-gray-500">還沒有評分的酒款</p>
          </div>
        )}
      </div>
    </div>
  );
}
