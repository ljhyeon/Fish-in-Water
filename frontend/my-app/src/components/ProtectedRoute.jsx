import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, getUserInfo } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
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

  // 인증된 사용자의 정보를 콘솔에 출력
  const userInfo = getUserInfo();
  console.log('✅ 인증된 사용자 정보:', {
    uid: userInfo.uid,
    email: userInfo.email,
    displayName: userInfo.displayName,
    photoURL: userInfo.photoURL,
    emailVerified: userInfo.emailVerified,
    loginTime: new Date().toLocaleString()
  });

  return children;
};

export default ProtectedRoute; 