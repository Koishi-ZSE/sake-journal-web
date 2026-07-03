import { useState, useEffect, useMemo } from 'react';
import { SakeItem, CustomSake, parseRiceField } from '../types';
import sakeDataRaw from '../../sake-data.json';

const CUSTOM_SAKE_KEY = 'sake_journal_custom_sake';
const IMAGE_OVERRIDES_KEY = 'sake_journal_image_overrides';  // 原始酒款圖片替換
const FIELD_OVERRIDES_KEY = 'sake_journal_field_overrides';  // 原始酒款欄位覆寫

// 解析日期字串為可排序的數字（YYYY/M/D → YYYYMMDD）
function parseDateToNum(dateStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.replace(/-/g, '/').split('/');
  if (parts.length < 3) return 0;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return y * 10000 + m * 100 + d;
}

// 預先解析所有原始資料的米種欄位，並按 firstDrinkDate 由新到舊排序
const parsedBaseData: SakeItem[] = (sakeDataRaw as SakeItem[])
  .map((item) => {
    const { rice, seimai } = parseRiceField(item.rice);
    return { ...item, riceParsed: rice, seimai };
  })
  .sort((a, b) => parseDateToNum(b.firstDrinkDate) - parseDateToNum(a.firstDrinkDate));

export function useSakeData() {
  const [customSake, setCustomSake] = useState<CustomSake[]>([]);
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, Partial<SakeItem>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_SAKE_KEY);
      if (stored) {
        const parsed: CustomSake[] = JSON.parse(stored);
        const withParsed = parsed.map((item) => {
          const { rice, seimai } = parseRiceField(item.rice);
          return { ...item, riceParsed: rice, seimai };
        });
        setCustomSake(withParsed);
      }
      const overrides = localStorage.getItem(IMAGE_OVERRIDES_KEY);
      if (overrides) setImageOverrides(JSON.parse(overrides));

      const fields = localStorage.getItem(FIELD_OVERRIDES_KEY);
      if (fields) setFieldOverrides(JSON.parse(fields));
    } catch (error) {
      console.error('Failed to load sake data:', error);
    }
    setIsLoading(false);
  }, []);

  // 合併：自訂酒款在前，套用所有覆寫
  const allSake = useMemo(() => {
    const applyOverrides = (item: SakeItem): SakeItem => {
      let result = { ...item };
      // 套用圖片覆寫
      if (imageOverrides[item.id]) result.imageUrl = imageOverrides[item.id];
      // 套用欄位覆寫
      if (fieldOverrides[item.id]) {
        const fo = fieldOverrides[item.id];
        result = { ...result, ...fo };
        // 若 rice 有更新，重新解析
        if (fo.rice !== undefined) {
          const { rice, seimai } = parseRiceField(fo.rice);
          result.riceParsed = rice;
          result.seimai = seimai;
        }
      }
      return result;
    };
    return [...customSake.map(applyOverrides), ...parsedBaseData.map(applyOverrides)];
  }, [customSake, imageOverrides, fieldOverrides]);

  const addCustomSake = (sake: Omit<CustomSake, 'isCustom' | 'createdAt'>) => {
    const { rice, seimai } = parseRiceField(sake.rice);
    const newSake: CustomSake = {
      ...sake,
      riceParsed: rice,
      seimai,
      isCustom: true,
      createdAt: Date.now(),
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    const updated = [...customSake, newSake];
    setCustomSake(updated);
    localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    return newSake;
  };

  const deleteCustomSake = (id: string) => {
    const updated = customSake.filter((s) => s.id !== id);
    setCustomSake(updated);
    localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
  };

  /** 更新任何酒款的照片 URL */
  const updateSakeImage = (id: string, imageUrl: string) => {
    const isCustom = customSake.some((s) => s.id === id);
    if (isCustom) {
      const updated = customSake.map((s) => s.id === id ? { ...s, imageUrl } : s);
      setCustomSake(updated);
      localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    } else {
      const updated = { ...imageOverrides, [id]: imageUrl };
      setImageOverrides(updated);
      localStorage.setItem(IMAGE_OVERRIDES_KEY, JSON.stringify(updated));
    }
  };

  /**
   * 更新任何酒款的任意欄位（包含原始 195 款）
   * 自訂酒款直接更新；原始酒款存入 fieldOverrides
   */
  const updateSake = (id: string, updates: Partial<SakeItem>) => {
    const isCustom = customSake.some((s) => s.id === id);
    if (isCustom) {
      const updated = customSake.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates };
        // 若 rice 有更新，重新解析
        if (updates.rice !== undefined) {
          const { rice, seimai } = parseRiceField(updates.rice);
          merged.riceParsed = rice;
          merged.seimai = seimai;
        }
        return merged;
      });
      setCustomSake(updated);
      localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    } else {
      const current = fieldOverrides[id] || {};
      const merged = { ...current, ...updates };
      const updated = { ...fieldOverrides, [id]: merged };
      setFieldOverrides(updated);
      localStorage.setItem(FIELD_OVERRIDES_KEY, JSON.stringify(updated));
      // 同步更新 imageOverrides（若有圖片變更）
      if (updates.imageUrl !== undefined) {
        const imgUpdated = { ...imageOverrides, [id]: updates.imageUrl };
        setImageOverrides(imgUpdated);
        localStorage.setItem(IMAGE_OVERRIDES_KEY, JSON.stringify(imgUpdated));
      }
    }
  };

  return { allSake, isLoading, addCustomSake, deleteCustomSake, updateSakeImage, updateSake };
}
