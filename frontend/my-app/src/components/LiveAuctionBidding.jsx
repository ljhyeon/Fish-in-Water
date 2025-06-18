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
  InputAdornment,
  Divider,
  Badge
} from '@mui/material';
import {
  Gavel,
  Timer,
  Person,
  TrendingUp,
  LocalAtm,
  History,
  EmojiEvents
} from '@mui/icons-material';
import { useLiveAuctionImproved } from '../hooks/useAuction';
import { useAuth } from '../hooks/useAuth';

const LiveAuctionBidding = ({ auctionId, auction }) => {
  const { user, userInfo } = useAuth();
  const { 
    liveData, 
    bidHistory,
    loading, 
    error, 
    bidding, 
    bid, 
    isActive, 
    currentPrice, 
    lastBidderId, 
    isMyBid,
    isParticipating,
    myHighestBid,
    bidCount 
  } = useLiveAuctionImproved(auctionId);
  
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

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
    
    if (!amount || amount < suggestedBidAmount) {
      setBidError(`최소 ${suggestedBidAmount.toLocaleString()}원 이상 입찰해주세요.`);
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

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}분 전`;
    } else if (seconds > 0) {
      return `${seconds}초 전`;
    } else {
      return '방금 전';
    }
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
            {bidCount > 0 && (
              <Badge badgeContent={bidCount} color="primary" sx={{ ml: 2 }}>
                <History />
              </Badge>
            )}
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
            {auction.origin} • {auction.species}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            판매자: {auction.seller?.name}
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
                    icon={isMyBid ? <EmojiEvents /> : <Person />}
                    label={isMyBid ? '내 입찰' : '다른 입찰자'}
                    color={isMyBid ? 'secondary' : 'default'}
                    variant="outlined"
                    sx={{ bgcolor: 'white' }}
                  />
                  {liveData?.last_bid_timestamp && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {formatRelativeTime(liveData.last_bid_timestamp)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* 내 참여 정보 */}
            {isParticipating && (
              <Box sx={{ 
                bgcolor: 'info.light', 
                color: 'info.contrastText',
                p: 2, 
                borderRadius: 1, 
                mb: 3 
              }}>
                <Typography variant="body2" gutterBottom>
                  내 참여 정보
                </Typography>
                <Typography variant="h6">
                  최고 입찰가: ₩{myHighestBid.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  {isMyBid ? '현재 최고가 입찰자입니다!' : '다른 입찰자가 더 높은 가격을 제시했습니다.'}
                </Typography>
              </Box>
            )}

            {/* 입찰 히스토리 토글 */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={() => setShowHistory(!showHistory)}
                size="small"
              >
                입찰 히스토리 ({bidCount})
              </Button>
              
              {showHistory && (
                <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                  <List dense>
                    {bidHistory.map((bid, index) => (
                      <ListItem key={bid.id} divider>
                        <ListItemText
                          primary={`₩${bid.amount.toLocaleString()}`}
                          secondary={formatTime(bid.timestamp)}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {bid.bidder_id === user?.uid ? (
                            <Chip label="내 입찰" size="small" color="primary" />
                          ) : (
                            <Chip label={`입찰자 ${index + 1}`} size="small" variant="outlined" />
                          )}
                          {index === 0 && (
                            <EmojiEvents sx={{ ml: 1, color: 'gold' }} />
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* 입찰 입력 섹션 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                입찰하기
              </Typography>
              
              {/* 빠른 입찰 버튼들 */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
                    disabled={bidding}
                  >
                    ₩{amount.toLocaleString()}
                  </Button>
                ))}
              </Box>

              {/* 입찰 금액 입력 */}
              <TextField
                fullWidth
                label="입찰 금액"
                value={bidAmount}
                onChange={handleBidAmountChange}
                error={!!bidError}
                helperText={bidError || `최소 입찰 금액: ₩${suggestedBidAmount.toLocaleString()}`}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₩</InputAdornment>,
                }}
                disabled={bidding}
                sx={{ mb: 2 }}
              />

              {/* 입찰 버튼 */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceBid}
                disabled={bidding || !bidAmount}
                startIcon={bidding ? <LocalAtm /> : <TrendingUp />}
              >
                {bidding ? '입찰 중...' : '입찰하기'}
              </Button>
            </Box>

            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : (
          <Alert severity="info">
            이 경매는 현재 진행 중이 아닙니다.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveAuctionBidding; 