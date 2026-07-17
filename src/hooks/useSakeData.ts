import { useState, useEffect, useMemo } from 'react';
import { SakeItem, CustomSake, parseRiceField } from '../types';
import sakeDataRaw from '../../sake-data.json';

// Google Apps Script Web App URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwd3UjQw1XtncTd6k_xBSIsXYgVytiXc-jA0AhwbiwwjGsujc4coFsKgAEYPtVgBkzW/exec';

// localStorage 快取 key（作為離線備份 ）
const CUSTOM_SAKE_KEY = 'sake_journal_custom_sake';
const OVERRIDES_CACHE_KEY = 'sake_journal_overrides_cache';

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

// 呼叫 Apps Script API（GET）
async function gasGet(action: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${GAS_URL}?action=${action}`);
  if (!res.ok) throw new Error(`GAS GET failed: ${res.status}`);
  return res.json();
}

// 呼叫 Apps Script API（POST）
async function gasPost(body: Record<string, unknown>): Promise<{ success: boolean; id?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GAS POST failed: ${res.status}`);
  return res.json();
}

export function useSakeData() {
  const [customSake, setCustomSake] = useState<CustomSake[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<SakeItem>>>({});
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
      const cachedOverrides = localStorage.getItem(OVERRIDES_CACHE_KEY);
      if (cachedOverrides) setOverrides(JSON.parse(cachedOverrides));
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }

    setIsLoading(false);

    gasGet('getOverrides')
      .then((data) => {
        const overridesData = data as Record<string, Partial<SakeItem>>;
        setOverrides(overridesData);
        localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(overridesData));
      })
      .catch((e) => {
        console.warn('Failed to load overrides from GAS, using cache:', e);
      });
  }, []);

  const allSake = useMemo(() => {
    const toNum = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };
    const applyOverrides = (item: SakeItem): SakeItem => {
      const override = overrides[item.id];
      if (!override) return item;
      const result = { ...item, ...override };
      if (override.rice !== undefined) {
        const { rice, seimai } = parseRiceField(override.rice as string);
        result.riceParsed = rice;
        result.seimai = seimai;
      }
      const numFields = ['aroma', 'smoothness', 'tasteScore', 'complexity', 'sweetness', 'rating'] as const;
      for (const field of numFields) {
        if (override[field] !== undefined) {
          result[field] = toNum(override[field]);
        }
      }
      return result;
    };
    return [...customSake.map(applyOverrides), ...parsedBaseData.map(applyOverrides)];
  }, [customSake, overrides]);

  /** 新增自訂酒款 */
  const addCustomSake = async (sake: Omit<CustomSake, 'isCustom' | 'createdAt'>) => {
    const { rice, seimai } = parseRiceField(sake.rice);
    const tempId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSake: CustomSake = {
      ...sake,
      riceParsed: rice,
      seimai,
      isCustom: true,
      createdAt: Date.now(),
      id: tempId,
    };
    const updated = [...customSake, newSake];
    setCustomSake(updated);
    localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    try {
      await gasPost({ action: 'addSake', sake: newSake });
    } catch (e) {
      console.warn('Failed to sync new sake to GAS:', e);
    }
    return newSake;
  };

  const deleteCustomSake = (id: string) => {
    const updated = customSake.filter((s) => s.id !== id);
    setCustomSake(updated);
    localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
  };

  /** 刪除酒款（本地 + GAS 同步） */
  const deleteSake = async (id: string): Promise<void> => {
    const isCustom = customSake.some((s) => s.id === id);
    if (isCustom) {
      const updated = customSake.filter((s) => s.id !== id);
      setCustomSake(updated);
      localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    } else {
      const newOverrides = { ...overrides };
      delete newOverrides[id];
      setOverrides(newOverrides);
      localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(newOverrides));
    }
    try {
      await gasPost({ action: 'deleteSake', id });
    } catch (e) {
      console.warn('Failed to sync delete to GAS:', e);
    }
  };

  /** 更新照片 URL */
  const updateSakeImage = async (id: string, imageUrl: string) => {
    const isCustom = customSake.some((s) => s.id === id);
    if (isCustom) {
      const updated = customSake.map((s) => s.id === id ? { ...s, imageUrl } : s);
      setCustomSake(updated);
      localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    } else {
      const newOverrides = { ...overrides, [id]: { ...(overrides[id] || {}), imageUrl } };
      setOverrides(newOverrides);
      localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(newOverrides));
    }
    try {
      await gasPost({ action: 'updateImage', id, imageUrl });
    } catch (e) {
      console.warn('Failed to sync image to GAS:', e);
    }
  };

  /** 更新任意欄位 */
  const updateSake = async (id: string, updates: Partial<SakeItem>) => {
    const isCustom = customSake.some((s) => s.id === id);
    if (isCustom) {
      const updated = customSake.map((s) => {
        if (s.id !== id) return s;
        const merged = { ...s, ...updates };
        if (updates.rice !== undefined) {
          const { rice, seimai } = parseRiceField(updates.rice as string);
          merged.riceParsed = rice;
          merged.seimai = seimai;
        }
        return merged;
      });
      setCustomSake(updated);
      localStorage.setItem(CUSTOM_SAKE_KEY, JSON.stringify(updated));
    } else {
      const current = overrides[id] || {};
      const merged = { ...current, ...updates };
      const newOverrides = { ...overrides, [id]: merged };
      setOverrides(newOverrides);
      localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(newOverrides));
    }
    try {
      await gasPost({ action: 'updateSake', id, updates });
    } catch (e) {
      console.warn('Failed to sync updates to GAS:', e);
    }
  };

  return { allSake, isLoading, addCustomSake, deleteCustomSake, updateSakeImage, updateSake, deleteSake };
}
