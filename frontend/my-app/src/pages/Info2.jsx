import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Typography, CircularProgress } from "@mui/material"

import { ImageWithBackButton } from '../components/info/ImageWithBackButton';
import { ProductInfoReadOnly } from '../components/info/ProductInfoReadOnly';
import InfoDialog from '../components/InfoDialog';
import { LoadingOverlay } from '../components/Spinner';

import { getAuction } from '../services/auctionService';

export function Info2() {
    const navigate = useNavigate();

    const isUserSeller = false; // 낙찰자인지 판매자인지 구분 필요 (false: 낙찰자, true: 판매자)

    const { id } = useParams();

    const [auctionData, setAuctionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // 경매 데이터 로딩
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setLoading(true);
                const auction = await getAuction(id);
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

    const handleButton = () => {
        if (isUserSeller) {
            setOpen(true);
        }
        else {
            console.log('결제 페이지로 넘어가는 것 같은 로딩');
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
                    src={auctionData?.image} 
                    onBackClick={() => navigate(-1)}  // 뒤로 가기 버튼 기능
                />
    
                {/* 매물 정보 */}
                <ProductInfoReadOnly dummyData={auctionData} type={2} />
                
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
                        {auctionData?.finalPrice?.toLocaleString('ko-KR') || 0} 원
                    </Typography>
                </Box>
                </Box>
            </InfoDialog>
        </>
    )
}