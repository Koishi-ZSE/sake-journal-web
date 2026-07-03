import { useMemo } from 'react';
import { SakeItem } from '../types';

interface FilterParams {
  searchQuery: string;
  sakeType?: string;
  riceType?: string;
  flavorProfile?: string;
  prefecture?: string;
}

export function useSakeFilter(allSake: SakeItem[], filters: FilterParams): SakeItem[] {
  return useMemo(() => {
    return allSake.filter((sake) => {
      // 搜尋
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          sake.name.toLowerCase().includes(q) ||
          (sake.brewery || '').toLowerCase().includes(q) ||
          (sake.prefecture || '').toLowerCase().includes(q) ||
          (sake.type || '').toLowerCase().includes(q) ||
          (sake.rice || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      // 酒體類型
      if (filters.sakeType && sake.type !== filters.sakeType) return false;

      // 米種
      if (filters.riceType && sake.rice !== filters.riceType) return false;

      // 風味
      if (filters.flavorProfile && sake.flavor !== filters.flavorProfile) return false;

      // 縣市
      if (filters.prefecture && sake.prefecture !== filters.prefecture) return false;

      return true;
    });
  }, [allSake, filters.searchQuery, filters.sakeType, filters.riceType, filters.flavorProfile, filters.prefecture]);
}

export function getFilterOptions(allSake: SakeItem[]) {
  const types = [...new Set(allSake.map((s) => s.type).filter(Boolean))].sort() as string[];
  const rices = [...new Set(allSake.map((s) => s.rice).filter(Boolean))].sort() as string[];
  const flavors = [...new Set(allSake.map((s) => s.flavor).filter(Boolean))].sort() as string[];
  const prefectures = [...new Set(allSake.map((s) => s.prefecture).filter(Boolean))].sort() as string[];

  return { types, rices, flavors, prefectures };
}
