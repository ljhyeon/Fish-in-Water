import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Google, Logout, Person } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const GoogleLogin = () => {
  const { 
    user, 
    userInfo,
    loading, 
    error, 
    signInWithGoogle, 
    signOut, 
    getUserInfo, 
    isAuthenticated,
    clearError
  } = useAuth();

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    
    if (result.success) {
      console.log('로그인 성공!', result.isNewUser ? '신규 사용자 (consumer로 자동 배정)' : '기존 사용자');
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      console.log('로그아웃 성공!');
    }
  };

  if (loading) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={2}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>인증 상태 확인 중...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && userInfo) {
    const authUserInfo = getUserInfo();
    
    return (
      <Card sx={{ mt: 2, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar 
              src={authUserInfo.photoURL} 
              alt={authUserInfo.displayName}
              sx={{ width: 56, height: 56 }}
            >
              <Person />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {authUserInfo.displayName || '사용자'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {authUserInfo.email}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={authUserInfo.emailVerified ? '이메일 인증됨' : '이메일 미인증'} 
                  size="small" 
                  color={authUserInfo.emailVerified ? 'success' : 'warning'}
                  variant="outlined"
                />
                
                <Chip 
                  label={userInfo.user_type === 'seller' ? '판매자' : '구매자'} 
                  size="small" 
                  color={userInfo.user_type === 'seller' ? 'secondary' : 'primary'}
                  variant="outlined"
                />

                {userInfo.user_type === 'seller' && (
                  <Chip 
                    label={userInfo.seller_info?.is_verified ? '인증완료' : '인증대기'} 
                    size="small" 
                    color={userInfo.seller_info?.is_verified ? 'success' : 'warning'}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            fullWidth
            disabled={loading}
          >
            {loading ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔐 구글 로그인
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          구글 계정으로 간편하게 로그인하세요
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: '#4285f4',
            '&:hover': {
              backgroundColor: '#3367d6',
            },
            py: 1.5
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              로그인 중...
            </>
          ) : (
            'Google로 로그인'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleLogin; 