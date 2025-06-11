import React from 'react';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';
import { Download, Notifications, PhoneAndroid } from '@mui/icons-material';
import { usePWA } from '../hooks/usePWA';

const PWAInstallButton = () => {
  const { 
    isInstallable, 
    isInstalled, 
    installPWA, 
    requestNotificationPermission 
  } = usePWA();

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      console.log('PWA가 성공적으로 설치되었습니다!');
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      console.log('알림 권한이 허용되었습니다!');
    } else {
      console.log('알림 권한이 거부되었습니다.');
    }
  };

  if (isInstalled) {
    return (
      <Card sx={{ mt: 2, backgroundColor: '#e8f5e8' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneAndroid color="success" />
            <Typography variant="body2" color="success.main">
              앱이 이미 설치되었습니다!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          PWA 기능
        </Typography>
        
        {isInstallable && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={handleInstall}
              fullWidth
              sx={{ mb: 1 }}
            >
              앱 설치하기
            </Button>
            <Typography variant="caption" color="text.secondary">
              홈 화면에 앱을 추가하여 더 빠르게 접근하세요
            </Typography>
          </Box>
        )}

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<Notifications />}
          onClick={handleNotificationPermission}
          fullWidth
          sx={{ mb: 1 }}
        >
          알림 권한 허용
        </Button>
        
        <Typography variant="caption" color="text.secondary">
          중요한 업데이트와 알림을 받으려면 권한을 허용해주세요
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PWAInstallButton; 