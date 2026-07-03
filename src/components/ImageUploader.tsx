import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadImage, validateImageFile } from '../utils/cloudinary';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  label?: string;
}

export function ImageUploader({ currentImageUrl, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 兩個獨立的 input：一個從相簿選擇（不帶 capture），一個拍照（帶 capture）
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 驗證檔案
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(false);
    setProgress(0);

    // 建立本地預覽
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上傳到 Cloudinary
    setUploading(true);
    try {
      const result = await uploadImage(file, (p) => setProgress(p));
      onUploadComplete(result.url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗，請重試');
      setPreview(null);
    } finally {
      setUploading(false);
      // 清除 input 以允許重複選擇同一檔案
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      {/* 預覽區域 */}
      {displayImage && (
        <div className="relative">
          <img
            src={displayImage}
            alt="酒款照片"
            className="w-full h-48 object-cover rounded-xl border border-gray-700"
          />
          {success && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle size={16} className="text-white" />
            </div>
          )}
        </div>
      )}

      {/* 上傳進度 */}
      {uploading && (
        <div className="border-2 border-dashed border-amber-600 bg-amber-900/20 rounded-xl p-5 text-center">
          <Loader2 size={28} className="mx-auto text-amber-400 animate-spin mb-2" />
          <p className="text-amber-400 text-sm font-medium">上傳中... {progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 兩個獨立按鈕：相簿 / 拍照 */}
      {!uploading && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-600 hover:border-amber-500 hover:bg-amber-900/10 bg-gray-900 rounded-xl p-4 cursor-pointer transition-all"
          >
            <Upload size={22} className="text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">從相簿選擇</span>
            <span className="text-gray-500 text-xs">JPG / PNG / WebP</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-600 hover:border-amber-500 hover:bg-amber-900/10 bg-gray-900 rounded-xl p-4 cursor-pointer transition-all"
          >
            <Camera size={22} className="text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">拍照上傳</span>
            <span className="text-gray-500 text-xs">直接拍攝</span>
          </button>
        </div>
      )}

      {/* 錯誤訊息 */}
      {error && (
        <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
          <X size={14} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* 成功訊息 */}
      {success && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
          <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-xs">照片上傳成功！</p>
        </div>
      )}

      {/* 從相簿選擇的 input（不帶 capture，讓系統顯示選擇器） */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,.heic"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 拍照的 input（帶 capture="environment" 直接開相機） */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
