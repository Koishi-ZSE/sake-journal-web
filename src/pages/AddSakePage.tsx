import React, { useState } from 'react';
import { SakeItem } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface AddSakePageProps {
  onAdd: (sake: Omit<SakeItem, 'id'>) => Promise<void>;
  allSake: SakeItem[];
  onCancel: () => void;
}

const BODY_STYLE_OPTIONS = ['薰', '爽', '醇', '熟'];

// 不帶後綴，與 sake-data.json 一致
const prefectures = [
  '北海道',
  '青森', '岩手', '宮城', '秋田', '山形', '福島',
  '茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川',
  '新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜',
  '静岡', '愛知', '三重',
  '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
  '鳥取', '島根', '岡山', '廣島', '山口',
  '徳島', '香川', '愛媛', '高知',
  '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄',
];

export function AddSakePage({ onAdd, allSake, onCancel }: AddSakePageProps) {
  // 動態酒體選項（與首頁篩選一致）
  const typeOptions = [...new Set(allSake.map((s) => s.type).filter(Boolean))].sort() as string[];

  const [formData, setFormData] = useState({
    name: '',
    brewery: '',
    prefecture: '',
    type: '',
    bodyType: '',
    rice: '',
    flavor: '',
    rating: '',
    notes: '',
    imageUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('請輸入酒名'); return; }
    if (!formData.prefecture.trim()) { alert('請選擇縣市'); return; }
    await onAdd({
      name: formData.name,
      brewery: formData.brewery || undefined,
      prefecture: formData.prefecture,
      type: formData.type || undefined,
      bodyType: formData.bodyType || undefined,
      rice: formData.rice || undefined,
      flavor: formData.flavor || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      notes: formData.notes || undefined,
      imageUrl: formData.imageUrl || undefined,
    });
  };

  const inputClass = "w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">新增酒款</h1>
        <p className="text-gray-400 text-sm">記錄您品嚐過的日本酒</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
        {/* 照片上傳 */}
        <div>
          <label className={labelClass}>酒款照片</label>
          <ImageUploader
            currentImageUrl={formData.imageUrl}
            onUploadComplete={handleImageUpload}
            label="拍照或從相簿選擇照片"
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">或輸入圖片網址</p>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass + " text-sm"}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>酒名 <span className="text-red-400">*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="例：獺祭" className={inputClass} required />
        </div>

        <div>
          <label className={labelClass}>釀造廠</label>
          <input type="text" name="brewery" value={formData.brewery} onChange={handleChange} placeholder="例：旭酒造" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>縣市 <span className="text-red-400">*</span></label>
          <select name="prefecture" value={formData.prefecture} onChange={handleChange} className={inputClass} required>
            <option value="">選擇縣市</option>
            {prefectures.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>

        {/* 酒體 + 風格 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>酒體</label>
            <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
              <option value="">選擇酒體</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>風格</label>
            <select name="bodyType" value={formData.bodyType} onChange={handleChange} className={inputClass}>
              <option value="">選擇風格</option>
              {BODY_STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 米種 + 質感 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>米種</label>
            <input type="text" name="rice" value={formData.rice} onChange={handleChange} placeholder="例：山田錦" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>質感</label>
            <input type="text" name="flavor" value={formData.flavor} onChange={handleChange} placeholder="例：清爽、果香" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>評分 (0–5)</label>
          <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="例：4.5" min="0" max="5" step="0.1" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>品飲筆記</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="記錄您對這款酒的感受..." rows={4} className={inputClass} />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2"
        >
          新增酒款
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors border border-gray-600"
        >
          取消新增
        </button>
      </form>
    </div>
  );
}
