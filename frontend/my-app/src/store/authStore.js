import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 인증 상태
      user: null,
      userInfo: null, // Firestore 사용자 정보 추가
      isAuthenticated: false,
      loading: false, // 초기 로딩 상태는 false로 설정
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

      // 완전한 로그아웃 (모든 데이터 삭제)
      completeLogout: () => {
        // localStorage 완전 삭제
        localStorage.clear();
        
        // sessionStorage 완전 삭제  
        sessionStorage.clear();
        
        // 브라우저 캐시 삭제 (service worker cache)
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.delete(cacheName);
            });
          });
        }
        
        // zustand 상태 초기화
        set({ 
          user: null, 
          userInfo: null,
          isAuthenticated: false, 
          loading: false,
          error: null 
        });
        
        console.log('🔥 완전한 로그아웃 완료 - 모든 데이터 삭제됨');
      },

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
      
      // 복원 시 isAuthenticated 상태 자동 설정
      onRehydrateStorage: () => (state) => {
        if (state && state.user && state.userInfo) {
          state.isAuthenticated = true;
          console.log('🔄 Zustand 상태 복원 완료 - 인증된 사용자:', state.user.email);
        }
      },
    }
  )
);

export default useAuthStore; 