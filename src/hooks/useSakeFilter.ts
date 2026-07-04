import { useMemo } from 'react';
import { SakeItem } from '../types';

// 由北到南的縣市順序
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

interface FilterParams {
  searchQuery: string;
  sakeType?: string;
  bodyStyle?: string;
  prefecture?: string;
  // 保留向下相容
  riceType?: string;
  flavorProfile?: string;
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

      // 風格（bodyType）
      if (filters.bodyStyle && sake.bodyType !== filters.bodyStyle) return false;

      // 縣市
      if (filters.prefecture && sake.prefecture !== filters.prefecture) return false;

      return true;
    });
  }, [allSake, filters.searchQuery, filters.sakeType, filters.bodyStyle, filters.riceType, filters.flavorProfile, filters.prefecture]);
}

export function getFilterOptions(allSake: SakeItem[]) {
  const types = [...new Set(allSake.map((s) => s.type).filter(Boolean))].sort() as string[];
  const rices = [...new Set(allSake.map((s) => s.rice).filter(Boolean))].sort() as string[];
  const flavors = [...new Set(allSake.map((s) => s.flavor).filter(Boolean))].sort() as string[];
  const prefectureSet = new Set(allSake.map((s) => s.prefecture).filter(Boolean) as string[]);
  const prefectures = PREFECTURE_ORDER.filter((p) => prefectureSet.has(p));
  // 加入不在預設順序中的縣市（排在最後）
  prefectureSet.forEach((p) => { if (!PREFECTURE_ORDER.includes(p)) prefectures.push(p); });

  return { types, rices, flavors, prefectures };
}
