import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    setUser, 
    setLoading, 
    setError, 
    clearError, 
    logout: clearUserState,
    getUserInfo 
  } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Firebase 인증 상태 변화 감지
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (mounted) {
        console.log('Auth state changed:', firebaseUser ? 'Logged in' : 'Logged out');
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser, setLoading]);

  // 에러 메시지 처리 함수
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return '로그인 창이 닫혔습니다.';
      case 'auth/popup-blocked':
        return '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
      case 'auth/cancelled-popup-request':
        return '로그인 요청이 취소되었습니다.';
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인해주세요.';
      case 'auth/too-many-requests':
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'auth/unauthorized-domain':
        return '승인되지 않은 도메인입니다.';
      case 'auth/account-exists-with-different-credential':
        return '이미 다른 방식으로 가입된 계정입니다.';
      default:
        return error.message || '로그인 중 오류가 발생했습니다.';
    }
  };

  // 구글 로그인 (팝업 방식만)
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('구글 로그인 성공:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('구글 로그인 실패:', error);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // 로그아웃
  const handleSignOut = async () => {
    try {
      setLoading(true);
      clearError();
      
      await signOut(auth);
      clearUserState();
      console.log('로그아웃 성공');
      
      return { success: true };
    } catch (error) {
      console.error('로그아웃 실패:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signInWithGoogle,
    signOut: handleSignOut,
    getUserInfo,
    clearError
  };
}; 