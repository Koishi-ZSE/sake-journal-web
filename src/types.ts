export interface SakeItem {
  id: string;
  name: string;
  brewery?: string;
  prefecture: string;
  type?: string;
  rice?: string;
  riceParsed?: string;       // 解析後的米種（不含精米步合）
  seimai?: string;           // 精米步合
  flavor?: string;
  rating?: number;
  notes?: string;
  imageUrl?: string;
  keywords?: string[];
  firstDrinkDate?: string;   // 品飲日期，格式 YYYY/M/D
}

export interface FilterOptions {
  searchQuery: string;
  sakeType?: string;
  riceType?: string;
  flavorProfile?: string;
  prefecture?: string;
}

export interface CustomSake extends SakeItem {
  isCustom: true;
  createdAt: number;
}

/**
 * 解析米種欄位，將 "米種/精米步合" 格式拆分
 * 例：
 *   "山田錦/50"         → { rice: "山田錦", seimai: "50%" }
 *   "國產米 50/掛55"    → { rice: "國產米", seimai: "麴50%/掛55%" }
 *   "石川門/60"         → { rice: "石川門", seimai: "60%" }
 *   "国産米"            → { rice: "国産米", seimai: undefined }
 */
export function parseRiceField(raw?: string): { rice?: string; seimai?: string } {
  if (!raw) return {};

  const trimmed = raw.trim();

  // 特殊格式：「國產米 50/掛55」—— 米種後面跟著 "麴數字/掛數字"
  const kojiKakeMatch = trimmed.match(/^(.+?)\s+(\d+)\s*\/\s*掛\s*(\d+)$/);
  if (kojiKakeMatch) {
    return {
      rice: kojiKakeMatch[1].trim(),
      seimai: `麴${kojiKakeMatch[2]}%/掛${kojiKakeMatch[3]}%`,
    };
  }

  // 多行格式：「麴:山田錦(21%)\n掛:五百万石(79%)\n /60」
  if (trimmed.includes('\n')) {
    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const lastLine = lines[lines.length - 1];
    const seimaiMatch = lastLine.match(/^\/?(\d+)$/);
    if (seimaiMatch) {
      const riceLines = lines.slice(0, -1).join(' / ');
      return { rice: riceLines, seimai: `${seimaiMatch[1]}%` };
    }
    return { rice: lines.join(' / ') };
  }

  // 一般格式：「米種/數字」或「米種/-」或「米種/?」
  const slashIdx = trimmed.lastIndexOf('/');
  if (slashIdx === -1) return { rice: trimmed };

  const ricePart = trimmed.slice(0, slashIdx).trim();
  const seimaiPart = trimmed.slice(slashIdx + 1).trim();

  // 精米步合部分只有數字（或 - / ?）
  if (/^[\d、,\s.]+$/.test(seimaiPart)) {
    // 可能有多個數字，如 "35、45"
    const nums = seimaiPart.split(/[、,\s]+/).map((n) => n.trim()).filter(Boolean);
    return {
      rice: ricePart,
      seimai: nums.map((n) => `${n}%`).join('／'),
    };
  }

  if (seimaiPart === '-' || seimaiPart === '?') {
    return { rice: ricePart, seimai: undefined };
  }

  // 無法解析，原樣返回
  return { rice: trimmed };
}
