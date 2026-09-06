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

// 五維評分滑桿元件
function ScoreSlider({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-semibold text-gray-300">
          {label}
        </label>

        <span className="text-sm font-bold text-amber-400">
          {value || '—'}
        </span>
      </div>

      <input
        type="range"
        name={name}
        min="1"
        max="5"
        step="0.5"
        value={value || '3'}
        onChange={onChange}
        className="w-full accent-amber-500"
      />

      <div className="flex justify-between text-xs text-gray-600 mt-0.5">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}

export function AddSakePage({
  onAdd,
  allSake,
  onCancel,
}: AddSakePageProps) {
  // 固定酒體選項（涵蓋所有常見種類）
  const typeOptions = [
    '純米大吟釀',
    '大吟釀',
    '純米吟釀',
    '吟釀',
    '特別純米酒',
    '純米酒',
    '特別本釀造',
    '本釀造',
    '其他/未標註',
  ];

  const [formData, setFormData] = useState({
    name: '',
    brewery: '',
    prefecture: '',
    type: '',
    bodyType: '',

    rice: '',

    // 精米步合
    seimai: '',
    kojiSeimai: '',
    kakeSeimai: '',

    flavor: '',
    brewingNote: '',
    otherNote: '',
    alcoholContent: '',
    sakeLevel: '',
    yeast: '',
    firstDrinkDate: '',

    // 五維評分（空字串代表未填）
    aroma: '',
    smoothness: '',
    tasteScore: '',
    complexity: '',
    sweetness: '',

    rating: '',
    description: '',
    imageUrl: '',
  });

  // 是否展開進階欄位
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 是否展開五維評分
  const [showScores, setShowScores] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('請輸入酒名');
      return;
    }

    if (!formData.prefecture.trim()) {
      alert('請選擇縣市');
      return;
    }

    await onAdd({
      name: formData.name.trim(),

      brewery:
        formData.brewery.trim() ||
        undefined,

      prefecture:
        formData.prefecture,

      type:
        formData.type ||
        undefined,

      bodyType:
        formData.bodyType ||
        undefined,

      rice:
        formData.rice.trim() ||
        undefined,

      // 精米步合
      seimai:
        formData.seimai.trim() ||
        undefined,

      kojiSeimai:
        formData.kojiSeimai.trim() ||
        undefined,

      kakeSeimai:
        formData.kakeSeimai.trim() ||
        undefined,

      flavor:
        formData.flavor.trim() ||
        undefined,

      brewingNote:
        formData.brewingNote.trim() ||
        undefined,

      otherNote:
        formData.otherNote.trim() ||
        undefined,

      alcoholContent:
        formData.alcoholContent.trim() ||
        undefined,

      sakeLevel:
        formData.sakeLevel.trim() ||
        undefined,

      yeast:
        formData.yeast.trim() ||
        undefined,

      firstDrinkDate:
        formData.firstDrinkDate ||
        undefined,

      aroma:
        formData.aroma
          ? parseFloat(formData.aroma)
          : undefined,

      smoothness:
        formData.smoothness
          ? parseFloat(formData.smoothness)
          : undefined,

      tasteScore:
        formData.tasteScore
          ? parseFloat(formData.tasteScore)
          : undefined,

      complexity:
        formData.complexity
          ? parseFloat(formData.complexity)
          : undefined,

      sweetness:
        formData.sweetness
          ? parseFloat(formData.sweetness)
          : undefined,

      rating:
        formData.rating
          ? parseFloat(formData.rating)
          : undefined,

      description:
        formData.description.trim() ||
        undefined,

      imageUrl:
        formData.imageUrl ||
        undefined,
    });
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500';

  const labelClass =
    'block text-sm font-semibold text-gray-300 mb-1.5';

  const sectionClass =
    'border border-gray-700 rounded-xl p-4 space-y-4 bg-gray-800/30';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-amber-400 mb-1">
          新增酒款
        </h1>

        <p className="text-gray-400 text-sm">
          記錄您品嚐過的日本酒
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-5"
      >
        {/* ── 照片上傳 ── */}
        <div>
          <label className={labelClass}>
            酒款照片
          </label>

          <ImageUploader
            currentImageUrl={formData.imageUrl}
            onUploadComplete={handleImageUpload}
            label="拍照或從相簿選擇照片"
          />

          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">
              或輸入圖片網址
            </p>

            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputClass + ' text-sm'}
            />
          </div>
        </div>

        {/* ── 基本資料 ── */}
        <div className={sectionClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            基本資料
          </p>

          <div>
            <label className={labelClass}>
              酒名{' '}
              <span className="text-red-400">
                *
              </span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="例：獺祭"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              釀造廠
            </label>

            <input
              type="text"
              name="brewery"
              value={formData.brewery}
              onChange={handleChange}
              placeholder="例：旭酒造"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              縣市{' '}
              <span className="text-red-400">
                *
              </span>
            </label>

            <select
              name="prefecture"
              value={formData.prefecture}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">
                選擇縣市
              </option>

              {prefectures.map((pref) => (
                <option
                  key={pref}
                  value={pref}
                >
                  {pref}
                </option>
              ))}
            </select>
          </div>

          {/* 酒體 + 風格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                酒體
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  選擇酒體
                </option>

                {typeOptions.map((t) => (
                  <option
                    key={t}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                風格
              </label>

              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  選擇風格
                </option>

                {BODY_STYLE_OPTIONS.map((s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 米種 */}
          <div>
            <label className={labelClass}>
              米種
            </label>

            <input
              type="text"
              name="rice"
              value={formData.rice}
              onChange={handleChange}
              placeholder="例：山田錦"
              className={inputClass}
            />
          </div>

          {/* 精米步合 */}
          <div>
            <label className={labelClass}>
              精米步合
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 一般精米步合 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  精米
                </p>

                <div className="relative">
                  <input
                    type="number"
                    name="seimai"
                    value={formData.seimai}
                    onChange={handleChange}
                    placeholder="50"
                    min="1"
                    max="100"
                    step="1"
                    className={inputClass + ' pr-9'}
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* 麴米 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  麴米
                </p>

                <div className="relative">
                  <input
                    type="number"
                    name="kojiSeimai"
                    value={formData.kojiSeimai}
                    onChange={handleChange}
                    placeholder="40"
                    min="1"
                    max="100"
                    step="1"
                    className={inputClass + ' pr-9'}
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* 掛米 */}
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  掛米
                </p>

                <div className="relative">
                  <input
                    type="number"
                    name="kakeSeimai"
                    value={formData.kakeSeimai}
                    onChange={handleChange}
                    placeholder="50"
                    min="1"
                    max="100"
                    step="1"
                    className={inputClass + ' pr-9'}
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              若酒標僅標示單一精米步合，只需填寫「精米」即可；若另外標示麴米、掛米，再分別填寫。
            </p>
          </div>

          {/* 質感 */}
          <div>
            <label className={labelClass}>
              質感
            </label>

            <input
              type="text"
              name="flavor"
              value={formData.flavor}
              onChange={handleChange}
              placeholder="例：清爽、果香"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              初飲日期
            </label>

            <input
              type="date"
              name="firstDrinkDate"
              value={formData.firstDrinkDate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* ── 品飲筆記 ── */}
        <div className={sectionClass}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            品飲筆記
          </p>

          <div>
            <label className={labelClass}>
              評分 (0–5)
            </label>

            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              placeholder="例：4.5"
              min="0"
              max="5"
              step="0.1"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              品飲筆記
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="記錄您對這款酒的感受..."
              rows={4}
              className={inputClass}
            />
          </div>
        </div>

        {/* ── 五維評分（可展開） ── */}
        <div className={sectionClass}>
          <button
            type="button"
            onClick={() =>
              setShowScores(!showScores)
            }
            className="w-full flex items-center justify-between text-left"
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              五維評分（選填）
            </p>

            <span className="text-gray-500 text-sm">
              {showScores
                ? '▲ 收起'
                : '▼ 展開'}
            </span>
          </button>

          {showScores && (
            <div className="space-y-4 pt-2">
              <ScoreSlider
                label="香氣"
                name="aroma"
                value={formData.aroma}
                onChange={handleChange}
              />

              <ScoreSlider
                label="順口"
                name="smoothness"
                value={formData.smoothness}
                onChange={handleChange}
              />

              <ScoreSlider
                label="酒味"
                name="tasteScore"
                value={formData.tasteScore}
                onChange={handleChange}
              />

              <ScoreSlider
                label="層次"
                name="complexity"
                value={formData.complexity}
                onChange={handleChange}
              />

              <ScoreSlider
                label="甜度"
                name="sweetness"
                value={formData.sweetness}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* ── 進階資料（可展開） ── */}
        <div className={sectionClass}>
          <button
            type="button"
            onClick={() =>
              setShowAdvanced(!showAdvanced)
            }
            className="w-full flex items-center justify-between text-left"
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              進階資料（選填）
            </p>

            <span className="text-gray-500 text-sm">
              {showAdvanced
                ? '▲ 收起'
                : '▼ 展開'}
            </span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    酒精濃度
                  </label>

                  <input
                    type="text"
                    name="alcoholContent"
                    value={
                      formData.alcoholContent
                    }
                    onChange={handleChange}
                    placeholder="例：16%"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    日本酒度
                  </label>

                  <input
                    type="text"
                    name="sakeLevel"
                    value={formData.sakeLevel}
                    onChange={handleChange}
                    placeholder="例：+3"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  酵母
                </label>

                <input
                  type="text"
                  name="yeast"
                  value={formData.yeast}
                  onChange={handleChange}
                  placeholder="例：協會9號"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  製法備註
                </label>

                <input
                  type="text"
                  name="brewingNote"
                  value={formData.brewingNote}
                  onChange={handleChange}
                  placeholder="例：生酒、無濾過"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  其他備註
                </label>

                <input
                  type="text"
                  name="otherNote"
                  value={formData.otherNote}
                  onChange={handleChange}
                  placeholder="其他補充說明"
                  className={inputClass}
                />
              </div>
            </div>
          )}
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
