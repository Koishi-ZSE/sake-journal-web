import React, { useState } from 'react';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { SakeItem } from '../types';

interface EditListPageProps {
  allSake: SakeItem[];
  onSelectSake: (id: string) => void;
  onAdd: () => void;
}

export function EditListPage({ allSake, onSelectSake, onAdd }: EditListPageProps) {
  const [query, setQuery] = useState('');

  const filtered = allSake.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.brewery || '').toLowerCase().includes(q) ||
      (s.prefecture || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-400 mb-1">編輯酒款</h1>
          <p className="text-gray-500 text-sm">選擇要編輯的酒款</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          新增
        </button>
      </div>

      {/* 搜尋欄 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋酒名、釀造廠、縣市..."
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm placeholder-gray-500"
        />
      </div>

      {/* 酒款清單 */}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">找不到符合的酒款</p>
        ) : (
          filtered.map((sake) => (
            <button
              key={sake.id}
              onClick={() => onSelectSake(sake.id)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors text-left"
            >
              {sake.imageUrl ? (
                <img src={sake.imageUrl} alt={sake.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-700" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">無圖</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-100 font-medium text-sm truncate">{sake.name}</p>
                <p className="text-gray-500 text-xs truncate">
                  {[sake.brewery, sake.prefecture].filter(Boolean).join(' · ')}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
