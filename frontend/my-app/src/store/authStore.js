import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 인증 상태
      user: null,
      userInfo: null, // Firestore 사용자 정보 추가
      isAuthenticated: false,
      loading: false,
      error: null,

      // 액션들
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setUserInfo: (userInfo) => set({ userInfo }), // Firestore 사용자 정보 설정

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      logout: () => set({ 
        user: null, 
        userInfo: null, // 로그아웃 시 userInfo도 초기화
        isAuthenticated: false, 
        error: null 
      }),

      // 사용자 정보 가져오기 (Firebase Auth)
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
      },

      // Firestore 사용자 정보 가져오기
      getFirestoreUserInfo: () => {
        return get().userInfo;
      },

      // 사용자 타입 확인
      getUserType: () => {
        const userInfo = get().userInfo;
        return userInfo?.user_type || null;
      },

      // 판매자 인증 여부 확인
      isVerifiedSeller: () => {
        const userInfo = get().userInfo;
        return userInfo?.user_type === 'seller' && userInfo?.seller_info?.is_verified === true;
      }
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage), // localStorage 사용
      partialize: (state) => ({ 
        user: state.user, 
        userInfo: state.userInfo, // userInfo도 영구 저장
        isAuthenticated: state.isAuthenticated 
      }), // user, userInfo, isAuthenticated만 영구 저장
    }
  )
);

export default useAuthStore; 