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
    flavor: sake.flavor || '',
    rating: sake.rating?.toString() || '',
    notes: sake.notes || '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('請輸入酒名'); return; }
    if (!formData.prefecture.trim()) { alert('請選擇縣市'); return; }

    onSave(sake.id, {
      name: formData.name.trim(),
      brewery: formData.brewery.trim() || undefined,
      prefecture: formData.prefecture.trim(),
      type: formData.type.trim() || undefined,
      rice: formData.rice.trim() || undefined,
      flavor: formData.flavor.trim() || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      notes: formData.notes.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      firstDrinkDate: formData.firstDrinkDate.trim() || undefined,
    });
    setSaved(true);
  };

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];

  const inputClass = "w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* 返回按鈕 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-6"
      >
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
          <ImageUploader
            currentImageUrl={formData.imageUrl}
            onUploadComplete={handleImageUpload}
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">或輸入圖片網址</p>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass}
            />
          </div>
        </div>

        {/* 酒名 */}
        <div>
          <label className={labelClass}>酒名 <span className="text-red-400">*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
        </div>

        {/* 釀造廠 */}
        <div>
          <label className={labelClass}>釀造廠</label>
          <input type="text" name="brewery" value={formData.brewery} onChange={handleChange} placeholder="例：旭酒造" className={inputClass} />
        </div>

        {/* 縣市 */}
        <div>
          <label className={labelClass}>縣市 <span className="text-red-400">*</span></label>
          <select name="prefecture" value={formData.prefecture} onChange={handleChange} className={inputClass} required>
            <option value="">選擇縣市</option>
            {prefectures.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>

        {/* 酒體 / 風味 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>酒體</label>
            <input type="text" name="type" value={formData.type} onChange={handleChange} placeholder="例：純米大吟釀" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>風味</label>
            <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="例：清爽、果香" className={inputClass} />
          </div>
        </div>

        {/* 米種 / 評分 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>米種</label>
            <input type="text" name="rice" value={formData.rice} onChange={handleChange} placeholder="例：山田錦" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>評分 (0–5)</label>
            <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="例：4.5" min="0" max="5" step="0.1" className={inputClass} />
          </div>
        </div>

        {/* 品飲日期 */}
        <div>
          <label className={labelClass}>品飲日期</label>
          <input type="text" name="firstDrinkDate" value={formData.firstDrinkDate} onChange={handleChange} placeholder="例：2024/3/15" className={inputClass} />
        </div>

        {/* 品飲筆記 */}
        <div>
          <label className={labelClass}>品飲筆記</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="記錄您對這款酒的感受..." rows={5} className={inputClass} />
        </div>

        {/* 儲存按鈕 */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-lg transition-colors mt-2 ${
            saved
              ? 'bg-green-700 text-white cursor-default'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          <Save size={18} />
          {saved ? '已儲存！' : '儲存變更'}
        </button>
      </form>
    </div>
  );
}
