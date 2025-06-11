import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button } from '@mui/material';
import GoogleLogin from '../components/GoogleLogin';

export function Login() {
    const navigate = useNavigate();

    const [showButton, setShowButton] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 3000); // 3초 후에 버튼 표시

        return () => clearTimeout(timer);
    }, []);

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
            
            <Button
                variant="outlined"
                startIcon={
                    <img 
                        src="https://developers.google.com/identity/images/g-logo.png" 
                        alt="Google"
                        style={{ width: '18px', height: '18px' }}
                    />
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
                onClick={() => {
                    // 구글 로그인 로직 구현
                    console.log('구글 로그인 클릭');
                    navigate('/home');
                }}
            >
                구글 계정으로 로그인
            </Button>
        </Box>
    )
}