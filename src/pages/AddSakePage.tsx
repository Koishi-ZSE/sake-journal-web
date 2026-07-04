import React, { useState } from 'react';
import { SakeItem } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface AddSakePageProps {
  onAdd: (sake: Omit<SakeItem, 'id'>) => Promise<void>;
}

export function AddSakePage({ onAdd }: AddSakePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    brewery: '',
    prefecture: '',
    type: '',
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
      rice: formData.rice || undefined,
      flavor: formData.flavor || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      notes: formData.notes || undefined,
      imageUrl: formData.imageUrl || undefined,
    });
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
          {/* 也保留 URL 輸入選項 */}
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
      </form>
    </div>
  );
}
