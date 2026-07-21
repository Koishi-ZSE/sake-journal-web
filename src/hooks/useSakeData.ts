import { useState, useEffect, useMemo, useCallback } from 'react';
import { SakeItem, CustomSake, parseRiceField } from '../types';
import sakeDataRaw from '../../sake-data.json';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwd3UjQw1XtncTd6k_xBSIsXYgVytiXc-jA0AhwbiwwjGsujc4coFsKgAEYPtVgBkzW/exec';

const SAKE_CACHE_KEY = 'sake_journal_sheet_cache';
const OVERRIDES_CACHE_KEY = 'sake_journal_overrides_cache';

function parseDateToNum(dateStr?: string): number {
  if (!dateStr) return 0;
  const parts = dateStr.replace(/-/g, '/').split('/');
  if (parts.length < 3) return 0;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  return y * 10000 + m * 100 + d;
}

function normalizeSake(item: SakeItem): SakeItem {
  const { rice, seimai } = parseRiceField(item.rice);
  return {
    ...item,
    riceParsed: item.riceParsed || rice,
    seimai: item.seimai || seimai,
  };
}

const fallbackData: SakeItem[] = (sakeDataRaw as SakeItem[])
  .map(normalizeSake)
  .sort((a, b) => parseDateToNum(b.firstDrinkDate) - parseDateToNum(a.firstDrinkDate));

async function gasGet<T>(action: string): Promise<T> {
  const url = `${GAS_URL}?action=${action}&t=${Date.now()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GAS GET failed: ${res.status}`);
  return res.json();
}

async function gasPost(body: Record<string, unknown>): Promise<{ success: boolean; id?: string; error?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GAS POST failed: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'GAS POST failed');
  return data;
}

export function useSakeData() {
  const [sheetSake, setSheetSake] = useState<SakeItem[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Partial<SakeItem>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadSakeFromSheet = useCallback(async () => {
    const data = await gasGet<SakeItem[]>('getAllSake');
    const normalized = data
      .map(normalizeSake)
      .sort((a, b) => parseDateToNum(b.firstDrinkDate) - parseDateToNum(a.firstDrinkDate));

    setSheetSake(normalized);
    localStorage.setItem(SAKE_CACHE_KEY, JSON.stringify(normalized));
    return normalized;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const cached = localStorage.getItem(SAKE_CACHE_KEY);
        if (cached && !cancelled) {
          setSheetSake(JSON.parse(cached));
        }

        const latest = await loadSakeFromSheet();
        if (!cancelled) setSheetSake(latest);
        const latestOverrides = await gasGet<Record<string, Partial<SakeItem>>>('getOverrides');
        if (!cancelled) {
           setOverrides(latestOverrides);
           localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(latestOverrides));
}
      } catch (e) {
        console.warn('Failed to load sake from Google Sheet:', e);

        if (!cancelled) {
          const cached = localStorage.getItem(SAKE_CACHE_KEY);
          if (cached) {
            setSheetSake(JSON.parse(cached));
          } else {
            setSheetSake(fallbackData);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [loadSakeFromSheet]);

  const allSake = useMemo(() => {
  return sheetSake
    .map((item) => ({
      ...item,
      ...(overrides[item.id] || {}),
    }))
    .map(normalizeSake)
    .sort((a, b) => parseDateToNum(b.firstDrinkDate) - parseDateToNum(a.firstDrinkDate));
}, [sheetSake, overrides]);

  const addCustomSake = async (sake: Omit<CustomSake, 'isCustom' | 'createdAt'>) => {
    const result = await gasPost({
      action: 'addSake',
      sake: {
        ...sake,
        isCustom: true,
        createdAt: Date.now(),
      },
    });

    const latest = await loadSakeFromSheet();

    if (result.id) {
      const created = latest.find((item) => item.id === result.id);
      if (created) return created;
    }

    const sameName = [...latest].reverse().find((item) => item.name === sake.name);
    return sameName || latest[0];
  };

  const deleteSake = async (id: string): Promise<void> => {
    await gasPost({ action: 'deleteSake', id });
    await loadSakeFromSheet();
  };

  const deleteCustomSake = async (id: string): Promise<void> => {
    await deleteSake(id);
  };

  const updateSakeImage = async (id: string, imageUrl: string) => {
    await gasPost({ action: 'updateImage', id, imageUrl });
    await loadSakeFromSheet();
  };

  const updateSake = async (id: string, updates: Partial<SakeItem>) => {
    await gasPost({ action: 'updateSake', id, updates });
    await loadSakeFromSheet();
  };

  return {
    allSake,
    isLoading,
    addCustomSake,
    deleteCustomSake,
    updateSakeImage,
    updateSake,
    deleteSake,
  };
}
