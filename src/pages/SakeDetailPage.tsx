import React, { useState } from 'react';
import { ArrowLeft, Star, Camera, X, Pencil } from 'lucide-react';
import { SakeItem } from '../types';
import { ImageUploader } from '../components/ImageUploader';

interface SakeDetailPageProps {
  sake: SakeItem;
  onBack: () => void;
  onUpdateImage?: (id: string, imageUrl: string) => void;
  onEdit?: () => void;  // 僅編輯者傳入
}

export function SakeDetailPage({ sake, onBack, onUpdateImage, onEdit }: SakeDetailPageProps) {
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(sake.imageUrl || '');
  const displayRice = sake.riceParsed || sake.rice;

  const handleUploadComplete = (url: string) => {
    setCurrentImageUrl(url);
    if (onUpdateImage) {
      onUpdateImage(sake.id, url);
    }
    // 延遲關閉，讓使用者看到成功訊息
    setTimeout(() => setShowPhotoEditor(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 頂部列：返回 + 編輯按鈕 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft size={20} />
          返回
        </button>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Pencil size={15} />
            編輯資訊
          </button>
        )}
      </div>

      {/* 詳細資訊 */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* 圖片區域 */}
        <div className="relative">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={sake.name}
              className="w-full h-80 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
              <p className="text-gray-600 text-sm">尚無照片</p>
            </div>
          )}
          {/* 替換照片按鈕（僅編輯者顯示） */}
          {onEdit && (
            <button
              onClick={() => setShowPhotoEditor(!showPhotoEditor)}
              className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-lg text-sm transition-all border border-white/20"
            >
              <Camera size={15} />
              {currentImageUrl ? '替換照片' : '新增照片'}
            </button>
          )}
        </div>

        {/* 照片上傳面板 */}
        {showPhotoEditor && (
          <div className="border-b border-gray-700 bg-gray-950 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">
                {currentImageUrl ? '替換照片' : '新增照片'}
              </h3>
              <button
                onClick={() => setShowPhotoEditor(false)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <ImageUploader
              currentImageUrl={currentImageUrl}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* 內容 */}
        <div className="p-6">
          {/* 標題 */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-100 leading-tight">{sake.name}</h1>
              {sake.rating && (
                <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/50 px-4 py-2 rounded-xl flex-shrink-0">
                  <Star className="fill-amber-400 text-amber-400" size={20} />
                  <span className="text-xl font-bold text-amber-400">{sake.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {sake.brewery && <p className="text-lg text-gray-400">{sake.brewery}</p>}
          </div>

          {/* 基本資訊 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-700">
            <div>
              <p className="text-xs text-gray-500 mb-1">縣市</p>
              <p className="text-base font-semibold text-gray-200">{sake.prefecture || '—'}</p>
            </div>
            {sake.type && (
              <div>
                <p className="text-xs text-gray-500 mb-1">酒體</p>
                <p className="text-base font-semibold text-gray-200">{sake.type}</p>
              </div>
            )}
            {sake.flavor && (
              <div>
                <p className="text-xs text-gray-500 mb-1">風味</p>
                <p className="text-base font-semibold text-gray-200">{sake.flavor}</p>
              </div>
            )}
            {displayRice && (
              <div>
                <p className="text-xs text-gray-500 mb-1">米種</p>
                <p className="text-base font-semibold text-gray-200">{displayRice}</p>
              </div>
            )}
            {sake.seimai && (
              <div>
                <p className="text-xs text-gray-500 mb-1">精米步合</p>
                <p className="text-base font-semibold text-amber-300">{sake.seimai}</p>
              </div>
            )}
            {sake.firstDrinkDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">品飲日期</p>
                <p className="text-base font-semibold text-gray-200">{sake.firstDrinkDate}</p>
              </div>
            )}
          </div>

          {/* 標籤 */}
          <div className="mb-6 flex flex-wrap gap-2">
            {sake.type && (
              <span className="bg-blue-900/60 text-blue-300 border border-blue-700/50 px-3 py-1 rounded-full text-sm">
                {sake.type}
              </span>
            )}
            {displayRice && (
              <span className="bg-green-900/60 text-green-300 border border-green-700/50 px-3 py-1 rounded-full text-sm">
                {displayRice}
              </span>
            )}
            {sake.seimai && (
              <span className="bg-yellow-900/60 text-yellow-300 border border-yellow-700/50 px-3 py-1 rounded-full text-sm">
                精米 {sake.seimai}
              </span>
            )}
            {sake.flavor && (
              <span className="bg-purple-900/60 text-purple-300 border border-purple-700/50 px-3 py-1 rounded-full text-sm">
                {sake.flavor}
              </span>
            )}
          </div>

          {/* 備註 */}
          {sake.notes && (
            <div>
              <p className="text-xs text-gray-500 mb-2">品飲筆記</p>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{sake.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
