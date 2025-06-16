import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import { createAllTestData, createTestUsers, createTestAuctions } from '../utils/demoData';

export default function TestDataPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleCreateAllData = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const data = await createAllTestData();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsers = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const userResults = await createTestUsers();
      setResults({ users: userResults, auctions: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuctions = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const auctionResults = await createTestAuctions();
      setResults({ users: [], auctions: auctionResults });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          생성 결과
        </Typography>
        
        {results.users && results.users.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                사용자 생성 결과
              </Typography>
              <List dense>
                {results.users.map((result, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={result.user}
                      secondary={result.success ? '성공' : `실패: ${result.error}`}
                    />
                    <Chip 
                      label={result.success ? '성공' : '실패'} 
                      color={result.success ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {results.auctions && results.auctions.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                경매 생성 결과
              </Typography>
              <List dense>
                {results.auctions.map((result, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={result.auction}
                      secondary={
                        result.success 
                          ? `상태: ${result.status}, 판매자: ${result.seller}` 
                          : `실패: ${result.error}`
                      }
                    />
                    <Chip 
                      label={result.success ? '성공' : '실패'} 
                      color={result.success ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        테스트 데이터 생성 도구
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        개발 및 테스트용 데이터를 Firebase에 생성합니다.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                모든 데이터 생성
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                테스트 사용자 4명과 다양한 상태의 경매 6개를 생성합니다.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateAllData}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? '생성 중...' : '모든 데이터 생성'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                사용자만 생성
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                테스트용 판매자 2명과 구매자 2명을 생성합니다.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handleCreateUsers}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? '생성 중...' : '사용자만 생성'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                경매만 생성
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                다양한 수산물 경매 6개를 생성합니다. (사용자가 먼저 있어야 함)
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleCreateAuctions}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? '생성 중...' : '경매만 생성'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          생성될 데이터 정보:
        </Typography>
        <Typography variant="body2">
          • <strong>판매자:</strong> seller1@test.com, seller2@test.com (인증 완료)<br/>
          • <strong>구매자:</strong> consumer1@test.com, consumer2@test.com<br/>
          • <strong>경매:</strong> 광어, 우럭, 농어, 도미, 갈치, 고등어 (PENDING, ACTIVE, FINISHED 상태 포함)
        </Typography>
      </Alert>

      <Alert severity="warning">
        <Typography variant="body2">
          <strong>주의:</strong> 이 도구는 개발/테스트 목적으로만 사용하세요. 
          실제 운영 환경에서는 사용하지 마세요.
        </Typography>
      </Alert>

      {renderResults()}
    </Box>
  );
} 