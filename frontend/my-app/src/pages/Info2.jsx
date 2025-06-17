import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Typography, CircularProgress } from "@mui/material"

import { ImageWithBackButton } from '../components/info/ImageWithBackButton';
import { ProductInfoReadOnly } from '../components/info/ProductInfoReadOnly';
import InfoDialog from '../components/InfoDialog';
import { LoadingOverlay } from '../components/Spinner';

import { getAuction, getImageUrl } from '../services/auctionService';
import { useLiveAuctionImproved } from '../hooks/useAuction';
import { useAuth } from '../hooks/useAuth';

export function Info2() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isUserSeller = false; // 낙찰자인지 판매자인지 구분 필요 (false: 낙찰자, true: 판매자)

    const { id } = useParams();

    const [auctionData, setAuctionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // 실시간 경매 데이터 및 입찰 기능
    const { 
        liveData, 
        bidHistory,
        isActive, 
        currentPrice, 
        isMyBid,
        isParticipating,
        myHighestBid 
    } = useLiveAuctionImproved(id);

    // 경매 데이터 로딩
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setLoading(true);
                const auction = await getAuction(id);
                console.log('Info2 - 서버에서 가져온 매물 데이터:', auction);
                if (auction) {
                    setAuctionData(auction);
                } else {
                    setError('경매 정보를 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error('Info2 - 경매 데이터 로딩 실패:', err);
                setError('경매 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAuctionData();
        }
    }, [id]);

    // 실시간 데이터 변경 감지 및 로그
    useEffect(() => {
        console.log('Info2 - 실시간 데이터 업데이트:', {
            liveData,
            isActive,
            currentPrice,
            isMyBid,
            isParticipating,
            myHighestBid,
            bidHistoryCount: bidHistory?.length || 0
        });
    }, [liveData, isActive, currentPrice, isMyBid, isParticipating, myHighestBid, bidHistory]);

    const handleButton = () => {
        
        if (isUserSeller) {
            setOpen(true);
        }
        else {
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, 3000); // 3초 후 로딩 완료
        }
    }

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

    // 현재 표시할 가격 (실시간 데이터가 있으면 우선, 없으면 최종 가격 또는 기본 가격)
    const displayPrice = isActive ? currentPrice : (auctionData.finalPrice || auctionData.currentPrice);
    
    const shouldShowButton = auctionData?.finalPrice && (
        isUserSeller || // 판매자면 항상 보여줌 (낙찰자 정보 확인)
        (!isUserSeller && auctionData?.status?.consumer !== "낙찰/결제완료") // 구매자면 결제완료가 아닐 때만
    );


    return (
        <>
            <LoadingOverlay  isVisible={isLoading}  message="결제 페이지로 이동"  />
            <Box sx={{width:'100%', height: '100%'}}>
                {/* 매물 이미지 */}
                <ImageWithBackButton 
                    src={getImageUrl(auctionData?.image)} 
                    onBackClick={() => navigate(-1)}  // 뒤로 가기 버튼 기능
                />
    
                {/* 매물 정보 */}
                <ProductInfoReadOnly 
                    dummyData={{
                        ...auctionData,
                        currentPrice: displayPrice, // 실시간 가격으로 업데이트
                        finalPrice: auctionData.finalPrice || displayPrice // 최종 가격
                    }} 
                    type={2} 
                />
                
                {/* 내 참여 정보 (경매가 완료되었어도 참여 정보 표시) */}
                {isParticipating && (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                            경매 참여 정보
                        </Typography>
                        <Typography variant="body2">
                            내 최고 입찰가: ₩{myHighestBid.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {auctionData.winner_id === user?.uid 
                                ? '🎉 축하합니다! 낙찰되었습니다!' 
                                : '아쉽게도 낙찰되지 못했습니다.'
                            }
                        </Typography>
                    </Box>
                )}
                
                {/* 하단 버튼 */}
                {shouldShowButton && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                        <Button variant="contained" onClick={handleButton}>
                            {isUserSeller ? "낙찰자 정보 확인" : "결제"}
                        </Button>
                    </Box>
                )}

            </Box>
            <InfoDialog
                open={open}
                onClose={() => setOpen(false)}
                confirmText="확인"
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="overline" sx={{ color: 'grey.700' }}>
                        낙찰자명
                    </Typography>
                    {/* 낙찰자 이름으로 변경 */}
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        홍길동
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="overline" sx={{ color: 'grey.700' }}>
                        최종 낙찰 금액
                    </Typography>
                    {/* 낙찰 금액으로 변경 */}
                    <Typography variant="body2" sx={{ color: 'grey.700' }}>
                        {displayPrice?.toLocaleString('ko-KR') || 0} 원
                    </Typography>
                </Box>
                </Box>
            </InfoDialog>
        </>
    )
}