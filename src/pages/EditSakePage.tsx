import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { SakeItem } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface EditSakePageProps {
  sake: SakeItem;
  onSave: (id: string, updates: Partial<SakeItem>) => void;
  onBack: () => void;
}

export function EditSakePage({ sake, onSave, onBack }: EditSakePageProps) {
  const [formData, setFormData] = useState({
    name: sake.name || '',
    brewery: sake.brewery || '',
    prefecture: sake.prefecture || '',
    type: sake.type || '',
    rice: sake.rice || sake.riceParsed || '',
    brewingNote: sake.brewingNote || '',
    otherNote: sake.otherNote || '',
    alcoholContent: sake.alcoholContent || '',
    sakeLevel: sake.sakeLevel || '',
    yeast: sake.yeast || '',
    bodyType: sake.bodyType || '',
    flavor: sake.flavor || '',
    description: sake.description || sake.notes || '',
    aroma: sake.aroma?.toString() || '',
    smoothness: sake.smoothness?.toString() || '',
    tasteScore: sake.tasteScore?.toString() || '',
    complexity: sake.complexity?.toString() || '',
    sweetness: sake.sweetness?.toString() || '',
    rating: sake.rating?.toString() || '',
    imageUrl: sake.imageUrl || '',
    firstDrinkDate: sake.firstDrinkDate || '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setSaved(false);
  };

  const parseScore = (v: string): number | undefined => {
    if (!v.trim()) return undefined;
    const n = parseFloat(v);
    return isNaN(n) ? undefined : Math.min(5, Math.max(0, n));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('請輸入酒名'); return; }

    onSave(sake.id, {
      name: formData.name.trim(),
      brewery: formData.brewery.trim() || undefined,
      prefecture: formData.prefecture.trim(),
      type: formData.type.trim() || undefined,
      rice: formData.rice.trim() || undefined,
      brewingNote: formData.brewingNote.trim() || undefined,
      otherNote: formData.otherNote.trim() || undefined,
      alcoholContent: formData.alcoholContent.trim() || undefined,
      sakeLevel: formData.sakeLevel.trim() || undefined,
      yeast: formData.yeast.trim() || undefined,
      bodyType: formData.bodyType.trim() || undefined,
      flavor: formData.flavor.trim() || undefined,
      description: formData.description.trim() || undefined,
      aroma: parseScore(formData.aroma),
      smoothness: parseScore(formData.smoothness),
      tasteScore: parseScore(formData.tasteScore),
      complexity: parseScore(formData.complexity),
      sweetness: parseScore(formData.sweetness),
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      firstDrinkDate: formData.firstDrinkDate.trim() || undefined,
    });
    setSaved(true);
  };

  const prefectures = [
    '北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島',
    '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
    '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜',
    '靜岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫',
    '奈良', '和歌山', '鳥取', '島根', '岡山', '廣島', '山口',
    '德島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎',
    '熊本', '大分', '宮崎', '鹿兒島', '沖繩',
  ];

  const inputClass = "w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-1.5";
  const sectionClass = "pt-4 border-t border-gray-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-6">
        <ArrowLeft size={20} />
        返回詳細頁面
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-amber-400 mb-1">編輯酒款資訊</h1>
        <p className="text-gray-500 text-sm truncate">{sake.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
        {/* 照片 */}
        <div>
          <label className={labelClass}>酒款照片</label>
          <ImageUploader currentImageUrl={formData.imageUrl} onUploadComplete={handleImageUpload} />
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">或輸入圖片網址</p>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" className={inputClass} />
          </div>
        </div>

        {/* 基本資訊 */}
        <div className={sectionClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">基本資訊</p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>酒名 <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>釀造廠</label>
                <input type="text" name="brewery" value={formData.brewery} onChange={handleChange} placeholder="例：旭酒造" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>縣市</label>
                <input type="text" name="prefecture" value={formData.prefecture} onChange={handleChange} placeholder="例：廣島" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* 酒款分類 */}
        <div className={sectionClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">酒款分類</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>酒體</label>
              <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="例：純米大吟釀" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>酒體分類</label>
              <select name="bodyType" value={formData.bodyType} onChange={handleChange} className={inputClass}>
                <option value="">選擇分類</option>
                <option value="薰">薰（華麗香氣）</option>
                <option value="爽">爽（清爽俐落）</option>
                <option value="醇">醇（豐醇厚實）</option>
                <option value="熟">熟（熟成風味）</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>風味分類</label>
              <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="例：濃郁、細緻" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>米種</label>
              <input type="text" name="rice" value={formData.rice} onChange={handleChange} placeholder="例：山田錦/50" className={inputClass} />
            </div>
          </div>
        </div>

        {/* 製造資訊 */}
        <div className={sectionClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">製造資訊</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>製法備註</label>
              <input type="text" name="brewingNote" value={formData.brewingNote} onChange={handleChange} placeholder="例：生酒、無濾過" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>酒精濃度</label>
              <input type="text" name="alcoholContent" value={formData.alcoholContent} onChange={handleChange} placeholder="例：15%" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>日本酒度</label>
              <input type="text" name="sakeLevel" value={formData.sakeLevel} onChange={handleChange} placeholder="例：+3" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>其他備註</label>
              <input type="text" name="otherNote" value={formData.otherNote} onChange={handleChange} placeholder="例：限定款" className={inputClass} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>酵母</label>
            <input type="text" name="yeast" value={formData.yeast} onChange={handleChange} placeholder="例：協會1801" className={inputClass} />
          </div>
        </div>

        {/* 五維評分 */}
        <div className={sectionClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">風味評分（0–5）</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {[
              { name: 'aroma', label: '香氣' },
              { name: 'smoothness', label: '順口' },
              { name: 'tasteScore', label: '酒味' },
              { name: 'complexity', label: '層次' },
              { name: 'sweetness', label: '甜度' },
            ].map((field) => (
              <div key={field.name}>
                <label className={labelClass}>{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={(formData as Record<string, string>)[field.name]}
                  onChange={handleChange}
                  placeholder="0–5"
                  min="0"
                  max="5"
                  step="0.5"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 綜合評分 */}
        <div className={sectionClass}>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">綜合評比</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>個人綜合評分 (0–5)</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="例：4.5" min="0" max="5" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>品飲日期</label>
              <input type="text" name="firstDrinkDate" value={formData.firstDrinkDate} onChange={handleChange} placeholder="例：2024/3/15" className={inputClass} />
            </div>
          </div>
        </div>

        {/* 品飲筆記 */}
        <div className={sectionClass}>
          <label className={labelClass}>品飲筆記</label>
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="記錄您對這款酒的感受..." rows={5} className={inputClass} />
        </div>

        {/* 儲存按鈕 */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg transition-colors mt-2 ${
            saved ? 'bg-green-700 text-white cursor-default' : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          <Save size={18} />
          {saved ? '已儲存！' : '儲存變更'}
        </button>
      </form>
    </div>
  );
}
