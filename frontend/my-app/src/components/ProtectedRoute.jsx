import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, getUserInfo } = useAuth();

  // Zustand에 인증된 사용자가 있으면 로딩 상태 건너뛰기
  if (isAuthenticated && user) {
    // console.log('✅ Zustand에서 인증된 사용자 확인됨');
    return children;
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          인증 상태 확인 중...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 인증되지 않은 사용자, 로그인 페이지로 이동');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 