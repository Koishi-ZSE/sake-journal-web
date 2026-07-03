import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function PasswordModal() {
  const { showPasswordModal, submitPassword, cancelPasswordModal } = useAuth();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasswordModal) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showPasswordModal]);

  if (!showPasswordModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = submitPassword(password);
    if (!ok) {
      setError('密碼錯誤，請再試一次');
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div
        className={`bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl ${shaking ? 'animate-shake' : ''}`}
        style={shaking ? { animation: 'shake 0.4s ease' } : {}}
      >
        {/* 標題 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-900/40 border border-amber-700/50 flex items-center justify-center">
              <Lock size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-100">編輯者驗證</h2>
              <p className="text-xs text-gray-500">請輸入編輯密碼</p>
            </div>
          </div>
          <button
            onClick={cancelPasswordModal}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="輸入密碼"
              className="w-full px-4 py-3 pr-11 bg-gray-800 border border-gray-600 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500 text-sm"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!password}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            進入編輯模式
          </button>
        </form>
      </div>

      {/* shake 動畫 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
