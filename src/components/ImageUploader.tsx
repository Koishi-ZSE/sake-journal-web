import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, CheckCircle } from 'lucide-react';
import { uploadImage, validateImageFile } from '../utils/cloudinary';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  label?: string;
}

const MAX_SIDE = 1200;
const QUALITY = 0.82;
const MAX_INPUT_SIZE_MB = 10;

function isHeicFile(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function isSupportedImage(file: File): boolean {
  return (
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp' ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function formatMb(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

/** 上傳前壓縮圖片：最長邊限制 1200px，JPEG 品質 0.82 */
function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('讀取照片失敗，請重新選擇照片'));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('無法解析照片格式，請改用 JPG、PNG 或 WebP'));
      };

      img.onload = () => {
        let { width, height } = img;

        if (!width || !height) {
          reject(new Error('照片尺寸異常，請重新選擇照片'));
          return;
        }

        if (width > MAX_SIDE || height > MAX_SIDE) {
          if (width >= height) {
            height = Math.round((height * MAX_SIDE) / width);
            width = MAX_SIDE;
          } else {
            width = Math.round((width * MAX_SIDE) / height);
            height = MAX_SIDE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('瀏覽器無法壓縮照片，請換一張照片或改用電腦上傳'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('照片壓縮失敗，請換一張照片'));
              return;
            }

            const safeName = file.name.replace(/\.[^.]+$/, '') || 'sake-photo';
            const compressed = new File([blob], `${safeName}.jpg`, {
              type: 'image/jpeg',
            });

            resolve(compressed);
          },
          'image/jpeg',
          QUALITY,
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ currentImageUrl, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetInputs = () => {
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const validateBeforeCompress = (file: File): string | null => {
    if (isHeicFile(file)) {
      return '不支援 HEIC/HEIF。為了節省雲端空間，請改用 JPG、PNG 或 WebP。iPhone 可到「設定 > 相機 > 格式」選擇「最相容」。';
    }

    if (!isSupportedImage(file)) {
      return '照片格式不支援，請選擇 JPG、PNG 或 WebP。';
    }

    if (file.size > MAX_INPUT_SIZE_MB * 1024 * 1024) {
      return `照片原檔 ${formatMb(file.size)} MB 太大，請選擇 ${MAX_INPUT_SIZE_MB} MB 以下的照片。`;
    }

    const validationError = validateImageFile(file);
    if (validationError) return validationError;

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateBeforeCompress(file);
    if (validationError) {
      setError(validationError);
      setSuccess(false);
      setPreview(null);
      resetInputs();
      return;
    }

    setError(null);
    setSuccess(false);
    setProgress(0);
    setUploading(true);

    try {
      const compressed = await compressImage(file);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(compressed);

      const result = await uploadImage(compressed, (p) => setProgress(p));
      onUploadComplete(result.url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '照片上傳失敗，請重試');
      setPreview(null);
      setSuccess(false);
    } finally {
      setUploading(false);
      resetInputs();
    }
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-3">
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

      {uploading && (
        <div className="border-2 border-dashed border-amber-600 bg-amber-900/20 rounded-xl p-5 text-center">
          <Loader2 size={28} className="mx-auto text-amber-400 animate-spin mb-2" />
          <p className="text-amber-400 text-sm font-medium">壓縮並上傳中... {progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

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
            <span className="text-gray-500 text-xs">建議 JPEG</span>
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
          <X size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs leading-relaxed">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
          <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-xs">照片已壓縮並上傳成功！</p>
        </div>
      )}

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
