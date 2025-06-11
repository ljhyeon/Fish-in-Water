import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

export function Login() {
    const navigate = useNavigate();
    const { 
        user, 
        loading, 
        error, 
        signInWithGoogle, 
        isAuthenticated,
        clearError,
        getUserInfo
    } = useAuth();

    const [showButton, setShowButton] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 3000); // 3초 후에 버튼 표시

        return () => clearTimeout(timer);
    }, []);

    // 로그인 상태가 변경되면 Home1으로 이동
    useEffect(() => {
        if (isAuthenticated) {
            console.log('🎉 로그인 성공! 사용자 정보:', getUserInfo());
            navigate('/home');
        }
    }, [isAuthenticated, navigate, getUserInfo]);

    const handleGoogleLogin = async () => {
        console.log('🔑 구글 로그인 시도 중...');
        const result = await signInWithGoogle();
        
        if (result.success) {
            console.log('✅ 구글 로그인 성공!', {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified
            });
            // useEffect에서 자동으로 navigate 처리됨
        } else {
            console.error('❌ 구글 로그인 실패:', result.error);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            minWidth: '100vw', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#f5f5f5'
        }}>
            <img src="/logo.svg" alt="로고" style={{ marginBottom: '40px' }} />
            
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2, maxWidth: '240px' }}
                    onClose={clearError}
                >
                    {error}
                </Alert>
            )}
            
            <Button
                variant="outlined"
                startIcon={
                    loading ? (
                        <CircularProgress size={18} />
                    ) : (
                        <img 
                            src="https://developers.google.com/identity/images/g-logo.png" 
                            alt="Google"
                            style={{ width: '18px', height: '18px' }}
                        />
                    )
                }
                sx={{
                    minWidth: '240px',
                    padding: '12px 24px',
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)',
                    opacity: showButton ? 1 : 0,
                    '&:hover': {
                        boxShadow: '0 1px 3px 0 rgba(60,64,67,0.30), 0 4px 8px 3px rgba(60,64,67,0.15)',
                    },
                    '&:active': {
                        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 2px 6px 2px rgba(60,64,67,0.15)'
                    }
                }}
                onClick={handleGoogleLogin}
                disabled={loading || !showButton}
            >
                {loading ? '로그인 중...' : '구글 계정으로 로그인'}
            </Button>
        </Box>
    )
}