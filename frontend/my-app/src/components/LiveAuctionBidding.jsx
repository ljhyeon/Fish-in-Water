import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  InputAdornment
} from '@mui/material';
import {
  Gavel,
  Timer,
  Person,
  TrendingUp,
  LocalAtm
} from '@mui/icons-material';
import { useLiveAuction } from '../hooks/useAuction';
import { useAuth } from '../hooks/useAuth';

const LiveAuctionBidding = ({ auctionId, auction }) => {
  const { user, userInfo } = useAuth();
  const { 
    liveData, 
    loading, 
    error, 
    bidding, 
    bid, 
    isActive, 
    currentPrice, 
    lastBidderId, 
    isMyBid 
  } = useLiveAuction(auctionId);
  
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  // 최소 입찰 단위 (1000원)
  const minBidIncrement = 1000;
  const suggestedBidAmount = currentPrice + minBidIncrement;

  const handleBidAmountChange = (event) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setBidAmount(value);
    setBidError('');
  };

  const handleQuickBid = (amount) => {
    setBidAmount(amount.toString());
    setBidError('');
  };

  const handlePlaceBid = async () => {
    const amount = parseInt(bidAmount);
    
    if (!amount || amount <= currentPrice) {
      setBidError(`최소 ${(currentPrice + minBidIncrement).toLocaleString()}원 이상 입찰해주세요.`);
      return;
    }

    try {
      await bid(amount);
      setBidAmount('');
      setBidError('');
    } catch (error) {
      setBidError(error.message);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FINISHED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '진행중';
      case 'PENDING':
        return '시작 예정';
      case 'FINISHED':
        return '종료';
      default:
        return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Timer sx={{ mr: 1 }} />
            <Typography variant="h6">경매 정보 로딩 중...</Typography>
          </Box>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!auction) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">경매 정보를 불러올 수 없습니다.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* 경매 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Gavel sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2">
              실시간 경매
            </Typography>
          </Box>
          <Chip 
            label={getStatusText(auction.status)}
            color={getStatusColor(auction.status)}
            variant="filled"
          />
        </Box>

        {/* 상품 정보 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {auction.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {auction.location} • {auction.species}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            판매자: {auction.seller_name}
          </Typography>
        </Box>

        {isActive ? (
          <>
            {/* 현재 입찰 정보 */}
            <Box sx={{ 
              bgcolor: 'success.light', 
              color: 'success.contrastText',
              p: 2, 
              borderRadius: 1, 
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  ₩{currentPrice.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  현재 최고가
                </Typography>
              </Box>
              {lastBidderId !== 'none' && (
                <Box sx={{ textAlign: 'right' }}>
                  <Chip 
                    icon={<Person />}
                    label={isMyBid ? '내 입찰' : '다른 입찰자'}
                    color={isMyBid ? 'secondary' : 'default'}
                    variant="outlined"
                    sx={{ bgcolor: 'white' }}
                  />
                  {liveData?.last_bid_timestamp && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {formatTime(liveData.last_bid_timestamp)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* 입찰하기 */}
            {user && userInfo?.user_type === 'consumer' ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  입찰하기
                </Typography>
                
                {/* 빠른 입찰 버튼들 */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    빠른 입찰
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      suggestedBidAmount,
                      suggestedBidAmount + 5000,
                      suggestedBidAmount + 10000,
                      suggestedBidAmount + 20000
                    ].map((amount) => (
                      <Button
                        key={amount}
                        variant="outlined"
                        size="small"
                        onClick={() => handleQuickBid(amount)}
                        startIcon={<TrendingUp />}
                      >
                        ₩{amount.toLocaleString()}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* 입찰 금액 입력 */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="입찰 금액"
                    value={bidAmount}
                    onChange={handleBidAmountChange}
                    placeholder={suggestedBidAmount.toLocaleString()}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                    }}
                    error={!!bidError}
                    helperText={bidError || `최소 입찰가: ₩${suggestedBidAmount.toLocaleString()}`}
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handlePlaceBid}
                  disabled={bidding || !bidAmount}
                  startIcon={<LocalAtm />}
                  sx={{ py: 1.5 }}
                >
                  {bidding ? '입찰 중...' : `₩${parseInt(bidAmount || 0).toLocaleString()} 입찰하기`}
                </Button>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                {!user ? '로그인 후 입찰에 참여하실 수 있습니다.' : 
                 userInfo?.user_type === 'seller' ? '판매자는 입찰에 참여할 수 없습니다.' : 
                 '구매자 계정으로 로그인해야 입찰할 수 있습니다.'}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          /* 경매 비활성 상태 */
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {auction.status === 'PENDING' ? '경매 시작 예정' : '경매가 종료되었습니다'}
            </Typography>
            
            {auction.status === 'PENDING' && (
              <Typography variant="body2" color="text.secondary">
                시작 시간: {new Date(auction.start_time?.seconds * 1000).toLocaleString()}
              </Typography>
            )}
            
            {auction.status === 'FINISHED' && (
              <Box>
                <Typography variant="h5" color="primary.main" gutterBottom>
                  최종 낙찰가: ₩{auction.final_price?.toLocaleString() || '유찰'}
                </Typography>
                {auction.winner_id && (
                  <Typography variant="body2" color="text.secondary">
                    낙찰자가 결정되었습니다
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveAuctionBidding; 