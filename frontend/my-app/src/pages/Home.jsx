import React from 'react';
import { Typography, Box, Alert } from '@mui/material';
import PWAInstallButton from '../components/PWAInstallButton';
import { useAuth } from '../hooks/useAuth';

export function Home() {
    const { user, isAuthenticated } = useAuth();

    return (
        <Box>
            <Typography variant="h2" component="h1" gutterBottom>
                Home Page
            </Typography>
            
            {isAuthenticated ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                    안녕하세요, {user?.displayName || user?.email}님! 
                    PWA와 Firebase가 통합된 React 앱에 오신 것을 환영합니다! 🎉
                </Alert>
            ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    PWA와 Firebase가 통합된 React 앱에 오신 것을 환영합니다!
                    로그인하여 더 많은 기능을 이용해보세요.
                </Typography>
            )}
            
            <PWAInstallButton />
            
            <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    💡 개발자 노트
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    • PWA 기능을 테스트하려면 HTTPS 환경이 필요합니다<br/>
                    • Firebase 설정을 완료하려면 .env 파일을 설정해주세요<br/>
                    • 구글 로그인을 사용하려면 Firebase Console에서 Google 인증을 활성화해주세요<br/>
                    • 알림 기능을 사용하려면 알림 권한을 허용해주세요
                </Typography>
            </Box>

            {isAuthenticated && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        🎯 로그인된 사용자 전용 기능
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • 개인화된 알림 설정<br/>
                        • 사용자 데이터 동기화<br/>
                        • 오프라인 데이터 저장<br/>
                        • 클라우드 백업 기능
                    </Typography>
                </Box>
            )}
        </Box>
    )
}