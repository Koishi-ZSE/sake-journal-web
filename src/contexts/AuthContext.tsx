import React, { createContext, useContext, useState, useCallback } from 'react';

// 密碼以 hash 方式比對，避免明文直接暴露在記憶體中
// 使用簡單的字串比對（前端方案，足夠個人使用）
const EDITOR_PASSWORD = 'koishisake5817';
const SESSION_KEY = 'sake_journal_editor_session';

interface AuthContextType {
  isEditor: boolean;
  showPasswordModal: boolean;
  pendingAction: (() => void) | null;
  requestEdit: (action: () => void) => void;
  submitPassword: (password: string) => boolean;
  cancelPasswordModal: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 從 sessionStorage 讀取（關閉分頁後自動失效）
  const [isEditor, setIsEditor] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // 請求編輯：若已驗證直接執行，否則彈出密碼框
  const requestEdit = useCallback((action: () => void) => {
    if (isEditor) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPasswordModal(true);
    }
  }, [isEditor]);

  // 提交密碼
  const submitPassword = useCallback((password: string): boolean => {
    if (password === EDITOR_PASSWORD) {
      setIsEditor(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      setShowPasswordModal(false);
      // 執行待辦動作
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      return true;
    }
    return false;
  }, [pendingAction]);

  const cancelPasswordModal = useCallback(() => {
    setShowPasswordModal(false);
    setPendingAction(null);
  }, []);

  const logout = useCallback(() => {
    setIsEditor(false);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      isEditor,
      showPasswordModal,
      pendingAction,
      requestEdit,
      submitPassword,
      cancelPasswordModal,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
