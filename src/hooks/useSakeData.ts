import { useState, useEffect, useMemo, useCallback } from 'react';
import { SakeItem, CustomSake, parseRiceField } from '../types';
import sakeDataRaw from '../../sake-data.json';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwd3UjQw1XtncTd6k_xBSIsXYgVytiXc-jA0AhwbiwwjGsujc4coFsKgAEYPtVgBkzW/exec';

const SAKE_CACHE_KEY = 'sake_journal_sheet_cache';
const OVERRIDES_CACHE_KEY = 'sake_journal_overrides_cache';

function parseRowNum(id?: string): number {
  if (!id) return 0;
  const match = String(id).match(/^row_(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function sortBySheetRowDesc(a: SakeItem, b: SakeItem): number {
  return parseRowNum(b.id) - parseRowNum(a.id);
}

function normalizeSake(item: SakeItem): SakeItem {
  const { rice, seimai } = parseRiceField(item.rice);
  return {
    ...item,
    riceParsed: item.riceParsed || rice,
    seimai: item.seimai || seimai,
  };
}

function getOverrideImageUrl(
  item: SakeItem,
  overrides: Record<string, Partial<SakeItem>>
): string | undefined {
  const overrideById = overrides[item.id];
  const numericId = item.id?.replace(/^row_/, '');
  const overrideByNumericId = numericId ? overrides[numericId] : undefined;

  const overrideByName = Object.values(overrides).find((override) => {
    if (!override.name) return false;
    return override.name === item.name && (!override.brewery || override.brewery === item.brewery);
  });

  return (
    overrideById?.imageUrl ||
    overrideByNumericId?.imageUrl ||
    overrideByName?.imageUrl ||
    item.imageUrl
  );
}

const fallbackData: SakeItem[] = (sakeDataRaw as SakeItem[])
  .map(normalizeSake)
  .sort(sortBySheetRowDesc);

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
      .sort(sortBySheetRowDesc);

    setSheetSake(normalized);
    localStorage.setItem(SAKE_CACHE_KEY, JSON.stringify(normalized));
    return normalized;
  }, []);

  const loadOverridesFromSheet = useCallback(async () => {
    const latestOverrides = await gasGet<Record<string, Partial<SakeItem>>>('getOverrides');
    setOverrides(latestOverrides);
    localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(latestOverrides));
    return latestOverrides;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const cached = localStorage.getItem(SAKE_CACHE_KEY);
        if (cached && !cancelled) {
          setSheetSake(JSON.parse(cached));
        }

        const cachedOverrides = localStorage.getItem(OVERRIDES_CACHE_KEY);
        if (cachedOverrides && !cancelled) {
          setOverrides(JSON.parse(cachedOverrides));
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
        imageUrl: getOverrideImageUrl(item, overrides),
      }))
      .map(normalizeSake)
      .sort(sortBySheetRowDesc);
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
    await loadOverridesFromSheet();
  };

  const updateSake = async (id: string, updates: Partial<SakeItem>) => {
    await gasPost({ action: 'updateSake', id, updates });
    await loadSakeFromSheet();
    await loadOverridesFromSheet();
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
