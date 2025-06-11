import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import GoogleLogin from '../components/GoogleLogin';

export function Login() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    로그인
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    구글 계정으로 간편하게 로그인하세요
                </Typography>
                
                <GoogleLogin />
                
                <Box sx={{ mt: 4, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        🔒 보안 안내
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Firebase Authentication을 통한 안전한 로그인<br/>
                        • 개인정보는 Google 정책에 따라 보호됩니다<br/>
                        • 로그인 시 이메일과 기본 프로필 정보에 접근합니다
                    </Typography>
                </Box>
            </Box>
        </Container>
    )
}