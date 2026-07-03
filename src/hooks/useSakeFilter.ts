import { useMemo } from 'react';
import { SakeItem } from '../types';

interface FilterOptions {
  searchQuery: string;
  selectedType: string;
  selectedRice: string;
  selectedFlavor: string;
  selectedPrefecture: string;
}

export function useSakeFilter(allSake: SakeItem[], filters: FilterOptions): SakeItem[] {
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
      if (filters.selectedType && sake.type !== filters.selectedType) return false;

      // 米種
      if (filters.selectedRice && sake.rice !== filters.selectedRice) return false;

      // 風味
      if (filters.selectedFlavor && sake.flavorType !== filters.selectedFlavor) return false;

      // 縣市
      if (filters.selectedPrefecture && sake.prefecture !== filters.selectedPrefecture) return false;

      return true;
    });
  }, [allSake, filters.searchQuery, filters.selectedType, filters.selectedRice, filters.selectedFlavor, filters.selectedPrefecture]);
}

export function getFilterOptions(allSake: SakeItem[]) {
  const types = [...new Set(allSake.map((s) => s.type).filter(Boolean))].sort() as string[];
  const rices = [...new Set(allSake.map((s) => s.rice).filter(Boolean))].sort() as string[];
  const flavors = [...new Set(allSake.map((s) => s.flavorType).filter(Boolean))].sort() as string[];
  const prefectures = [...new Set(allSake.map((s) => s.prefecture).filter(Boolean))].sort() as string[];

  return { types, rices, flavors, prefectures };
}
