import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material"

import { ImageWithBackButton } from '../components/info/ImageWithBackButton';
import { ProductInfoReadOnly } from '../components/info/ProductInfoReadOnly';
import FormDialog from '../components/FormDialog';
import InfoDialog from '../components/InfoDialog';

import { getAuction, getImageUrl } from '../services/auctionService';
import { useLiveAuctionImproved } from '../hooks/useAuction';
import { useAuth } from '../hooks/useAuth';

export function Info1() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [auctionData, setAuctionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 실시간 경매 데이터 및 입찰 기능
    const { 
        liveData, 
        bidHistory,
        bidding, 
        bid, 
        isActive, 
        currentPrice, 
        isMyBid,
        isParticipating,
        myHighestBid 
    } = useLiveAuctionImproved(id);

    const [openFirst, setOpenFirst] = useState(false);
    const [openMinPrice, setOpenMinPrice] = useState(false);
    const [openMinMyPrice, setOpenMinMyPrice] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openError, setOpenError] = useState(false);
    const [openExpired, setOpenExpired] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // 경매 데이터 로딩
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setLoading(true);
                const auction = await getAuction(id);
                console.log('서버에서 가져온 매물 데이터:', auction);
                if (auction) {
                    setAuctionData(auction);
                } else {
                    setError('경매 정보를 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error('경매 데이터 로딩 실패:', err);
                setError('경매 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAuctionData();
        }
    }, [id]);

    // 경매 종료 여부 확인 함수
    const isAuctionExpired = () => {
        if (!auctionData) return false;
        
        // 1. 상태 기반 체크 (우선순위)
        if (auctionData.status === 'FINISHED' || auctionData.displayStatus === 'FINISHED') {
            return true;
        }
        
        // 2. 시간 기반 체크 (보조)
        if (!auctionData.auction_end_time) return false;
        
        // 서울시간 기준으로 현재 시간과 비교
        const now = new Date();
        const kstDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
        const seoulNow = new Date(kstDateString);
        
        // 경매 종료시간 파싱
        let endTime;
        if (auctionData.auction_end_time.includes('+') || auctionData.auction_end_time.includes('Z')) {
            endTime = new Date(auctionData.auction_end_time);
        } else {
            endTime = new Date(auctionData.auction_end_time + '+09:00');
        }
        
        return seoulNow >= endTime;
    };

    const handleOpen = () => {
        if (!user) {
            setErrorMessage('로그인이 필요합니다.');
            setOpenError(true);
            return;
        }
        
        // 경매 종료 여부 확인
        if (isAuctionExpired()) {
            setOpenExpired(true);
            return;
        }
        
        if (!isActive) {
            setErrorMessage('현재 진행 중인 경매가 아닙니다.');
            setOpenError(true);
            return;
        }
        setOpenFirst(true);
    };

    const handleClose = () => setOpenFirst(false);

    const handleSubmit = async (data) => {
        console.log('Submitted data:', data);
        const bidAmount = parseInt(data.bid);
        
        if (!bidAmount || bidAmount <= 0) {
            setErrorMessage('올바른 입찰 금액을 입력해주세요.');
            setOpenError(true);
            handleClose(); // 입력창 닫기
            return;
        }

        // 최소 입찰 금액 확인 (현재가)
        const minBidAmount = currentPrice + 1;
        if (bidAmount < minBidAmount) {
            handleClose(); // 입력창 닫기
            setOpenMinPrice(true);
            return;
        }

        // 내 이전 입찰보다 낮은지 확인
        if (isParticipating && bidAmount <= myHighestBid) {
            handleClose(); // 입력창 닫기
            setOpenMinMyPrice(true);
            return;
        }

        try {
            // 실제 입찰 실행
            await bid(bidAmount);
            handleClose(); // 입력창 닫기
            setOpenSuccess(true);
        } catch (error) {
            console.error('입찰 실패:', error);
            setErrorMessage(error.message || '입찰에 실패했습니다.');
            handleClose(); // 입력창 닫기
            setOpenError(true);
        }
    };

    // 로딩 중일 때
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    // 에러가 있거나 데이터가 없을 때
    if (error || !auctionData) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    {error || '경매 정보를 찾을 수 없습니다.'}
                </Typography>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    뒤로 가기
                </Button>
            </Box>
        );
    }

    // 현재 표시할 가격 (경매 종료시 최종가격, 실시간 데이터가 있으면 우선, 없으면 기본 데이터)
    const displayPrice = isAuctionExpired() && auctionData.finalPrice 
        ? auctionData.finalPrice 
        : (isActive ? currentPrice : auctionData.currentPrice);

    return (
        <>
        <Box sx={{width:'100%', height: '100%'}}>
            {/* 매물 이미지 */}
            <ImageWithBackButton 
                src={getImageUrl(auctionData.image)} 
                onBackClick={() => navigate(-1)}  // 뒤로 가기 버튼 기능
            />

            {/* 경매 상태 알림 */}
            {isAuctionExpired() && (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        🏁 경매가 종료되었습니다. 
                        {auctionData.finalPrice && `최종 낙찰가: ₩${auctionData.finalPrice.toLocaleString()}`}
                    </Alert>
                </Box>
            )}

            {!isAuctionExpired() && isActive && (
                <Box sx={{ p: 2 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        🔥 실시간 경매 진행 중! 현재 최고가: ₩{currentPrice.toLocaleString()}
                        {isMyBid && " (내 입찰)"}
                    </Alert>
                </Box>
            )}

            {!isAuctionExpired() && !isActive && auctionData.status === 'ACTIVE' && (
                <Box sx={{ p: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        경매 시작 대기 중입니다.
                    </Alert>
                </Box>
            )}

            {/* 매물 정보 */}
            <ProductInfoReadOnly 
                dummyData={{
                    ...auctionData,
                    currentPrice: displayPrice // 실시간 가격으로 업데이트
                }} 
            />
            
            {/* 내 참여 정보 */}
            {isParticipating && (
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color={isAuctionExpired() ? "text.primary" : "primary"} gutterBottom>
                        {isAuctionExpired() ? "경매 참여 완료" : "경매 참여 중"}
                    </Typography>
                    <Typography variant="body2">
                        내 {isAuctionExpired() ? "최종" : "최고"} 입찰가: ₩{myHighestBid.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isAuctionExpired() 
                            ? (auctionData.winner_id === user?.uid 
                                ? '🎉 축하합니다! 낙찰자입니다!' 
                                : '다른 입찰자가 낙찰받았습니다.')
                            : (isMyBid ? '현재 최고가 입찰자입니다!' : '다른 입찰자가 더 높은 가격을 제시했습니다.')
                        }
                    </Typography>
                </Box>
            )}
            
            {/* 하단 버튼 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={handleOpen}
                    disabled={bidding || !user || isAuctionExpired()}
                    fullWidth
                    sx={{ mb: 5,}}
                >
                    {isAuctionExpired() 
                        ? "경매 종료" 
                        : (bidding ? "입찰 중..." : isParticipating ? "재입찰" : "경매 참여")
                    }
                </Button>
                
                {!user && !isAuctionExpired() && (
                    <Typography variant="caption" color="text.secondary">
                        로그인 후 경매에 참여하실 수 있습니다.
                    </Typography>
                )}
                
                {isAuctionExpired() && (
                    <Typography variant="caption" color="error">
                        경매가 종료되어 더 이상 입찰할 수 없습니다.
                    </Typography>
                )}
                
                {!isAuctionExpired() && isActive && (
                    <Typography variant="caption" color="success.main">
                        최소 입찰 금액: ₩{(currentPrice + 1).toLocaleString()}
                    </Typography>
                )}
            </Box>
        </Box>
        
        <FormDialog
            open={openFirst}
            onClose={handleClose}
            onSubmit={(data) => handleSubmit(data)}
            submitText="입찰"
            fields={[
                { 
                    name: 'bid', 
                    label: '입찰 금액', 
                    type: 'text', // number에서 text로 변경
                    required: true,
                    placeholder: isActive ? (currentPrice + 1).toLocaleString() : auctionData.startPrice.toLocaleString()
                },
            ]}
        />
        
        <InfoDialog
            open={openMinPrice}
            onClose={() => setOpenMinPrice(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>
                입찰 금액이 최소 입찰 금액보다 낮습니다. 
                최소 ₩{(currentPrice + 1).toLocaleString()} 이상 입찰해주세요.
            </Typography>
        </InfoDialog>
        
        <InfoDialog
            open={openMinMyPrice}
            onClose={() => setOpenMinMyPrice(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>
                입찰 금액이 이전 입찰가(₩{myHighestBid.toLocaleString()})보다 낮거나 같습니다. 
                더 높은 금액을 입찰해주세요.
            </Typography>
        </InfoDialog>
        
        <InfoDialog
            open={openSuccess}
            onClose={() => setOpenSuccess(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>
                입찰이 성공적으로 완료되었습니다! 🎉
            </Typography>
        </InfoDialog>
        
        <InfoDialog
            open={openExpired}
            onClose={() => {
                setOpenExpired(false);
                // 2초 후 이전 페이지로 이동
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            }}
            confirmText="확인"
        >
            <Typography variant='body2'>
                종료된 경매입니다. 이전 페이지로 이동합니다.
            </Typography>
        </InfoDialog>
        
        <InfoDialog
            open={openError}
            onClose={() => setOpenError(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>
                {errorMessage}
            </Typography>
        </InfoDialog>
    </>
    )
}