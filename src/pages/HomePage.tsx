import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SakeItem } from '../types';
import { SakeCard } from '../components/SakeCard';
import { useSakeFilter, getFilterOptions } from '../hooks/useSakeFilter';

interface HomePageProps {
  allSake: SakeItem[];
  onSakeClick: (id: string) => void;
}

const BODY_STYLE_OPTIONS = ['薰', '爽', '醇', '熟'];

export function HomePage({ allSake, onSakeClick }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBodyStyle, setSelectedBodyStyle] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');

  const filterOptions = getFilterOptions(allSake);
  const filteredSake = useSakeFilter(allSake, {
    searchQuery,
    sakeType: selectedType,
    bodyStyle: selectedBodyStyle,
    prefecture: selectedPrefecture,
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedBodyStyle('');
    setSelectedPrefecture('');
  };

  const hasActiveFilters = searchQuery || selectedType || selectedBodyStyle || selectedPrefecture;

  const selectClass = "w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-amber-500";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 標題 */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">koshi_sake journal</h1>
        <p className="text-gray-400 text-sm">
          {filteredSake.length} 款
        </p>
      </div>

      {/* 搜尋欄 */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="搜尋酒名、釀造廠、筆記..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* 篩選面板 */}
      <div className="mb-5 bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">篩選條件</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              清除全部
            </button>
          )}
        </div>

        {/* 上層：酒體 + 風格 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">酒體</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={selectClass}>
              <option value="">全部</option>
              {filterOptions.types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">風格</label>
            <select value={selectedBodyStyle} onChange={(e) => setSelectedBodyStyle(e.target.value)} className={selectClass}>
              <option value="">全部</option>
              {BODY_STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 下層：縣市（全寬） */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">縣市</label>
          <select value={selectedPrefecture} onChange={(e) => setSelectedPrefecture(e.target.value)} className={selectClass}>
            <option value="">全部</option>
            {filterOptions.prefectures.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 酒款清單 */}
      <div className="flex flex-col gap-3">
        {filteredSake.length > 0 ? (
          filteredSake.map((sake) => (
            <div key={sake.id} onClick={() => onSakeClick(sake.id)}>
              <SakeCard sake={sake} />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-4">🍶</p>
            <p className="text-gray-500">沒有找到符合條件的酒款</p>
          </div>
        )}
      </div>
    </div>
  );
}
