import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 인증 상태
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // 액션들
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        error: null 
      }),

      // 사용자 정보 가져오기
      getUserInfo: () => {
        const user = get().user;
        if (!user) return null;
        
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        };
      }
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage), // localStorage 사용
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }), // user와 isAuthenticated만 영구 저장
    }
  )
);

export default useAuthStore; 