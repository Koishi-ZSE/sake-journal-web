// Cloudinary 設定
const CLOUD_NAME = 'lyuww36c';
const UPLOAD_PRESET = 'sake_journal';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * 上傳圖片到 Cloudinary
 * @param file 要上傳的圖片檔案
 * @param onProgress 上傳進度回調（0-100）
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'sake-journal');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
        });
      } else {
        reject(new Error(`上傳失敗：${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('網路錯誤，上傳失敗'));
    });

    xhr.open('POST', UPLOAD_URL);
    xhr.send(formData);
  });
}

/**
 * 驗證圖片檔案
 */
export function validateImageFile(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
    return '請上傳 JPG、PNG、WebP 或 HEIC 格式的圖片';
  }

  if (file.size > maxSize) {
    return '圖片大小不能超過 10MB';
  }

  return null;
}
