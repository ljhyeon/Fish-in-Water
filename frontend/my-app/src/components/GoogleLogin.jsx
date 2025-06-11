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
      console.log('로그인 성공!');
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

  if (isAuthenticated) {
    const userInfo = getUserInfo();
    
    return (
      <Card sx={{ mt: 2, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar 
              src={userInfo.photoURL} 
              alt={userInfo.displayName}
              sx={{ width: 56, height: 56 }}
            >
              <Person />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" gutterBottom>
                {userInfo.displayName || '사용자'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {userInfo.email}
              </Typography>
              <Chip 
                label={userInfo.emailVerified ? '이메일 인증됨' : '이메일 미인증'} 
                size="small" 
                color={userInfo.emailVerified ? 'success' : 'warning'}
                variant="outlined"
              />
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