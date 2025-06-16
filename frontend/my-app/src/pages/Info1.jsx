import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Typography, CircularProgress } from "@mui/material"

import { ImageWithBackButton } from '../components/info/ImageWithBackButton';
import { ProductInfoReadOnly } from '../components/info/ProductInfoReadOnly';
import FormDialog from '../components/FormDialog';
import InfoDialog from '../components/InfoDialog';

import { getAuction } from '../services/auctionService';

export function Info1() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [auctionData, setAuctionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [myPrice, setMyPrice] = useState(0);
    const [join, isJoin] = useState(false);

    const [openFirst, setOpenFirst] = useState(false);
    const [openMinPrice, setOpenMinPrice] = useState(false);
    const [openMinMyPrice, setOpenMinMyPrice] = useState(false);

    // 경매 데이터 로딩
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setLoading(true);
                const auction = await getAuction(id);
                if (auction) {
                    setAuctionData(auction);
                    setMyPrice(auction.currentPrice);
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

    const handleOpen = () => setOpenFirst(true);
    const handleClose = () => setOpenFirst(false);
    const handleSubmit = (data) => {
        console.log('Submitted data:', data);
        const bid = parseInt(data.bid)
        if (bid > auctionData.startPrice) {
            if (bid < myPrice) {
                setOpenMinMyPrice(true);
            }
            else {
                setMyPrice(bid);
                isJoin(true);
            }
        }
        else {
            // 새로운 팝업
            setOpenMinPrice(true);
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

    return (
        <>
        <Box sx={{width:'100%', height: '100%'}}>
            {/* 매물 이미지 */}
            <ImageWithBackButton 
                src={auctionData.image} 
                onBackClick={() => navigate(-1)}  // 뒤로 가기 버튼 기능
            />

            {/* 매물 정보 */}
            <ProductInfoReadOnly dummyData={auctionData} />
            
            {/* 하단 버튼 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                <Button variant="contained" onClick={handleOpen}>
                    {join ? "재입찰" : "경매 참여"}
                </Button>
                {join && (
                    <Typography variant='overline'>현재 나의 입찰 금액: {myPrice.toLocaleString('ko-KR')}원</Typography>
                )}
            </Box>
        </Box>
        <FormDialog
            open={openFirst}
            onClose={handleClose}
            onSubmit={(data) => handleSubmit(data)}
            submitText="입찰"
            fields={[
                { name: 'bid', label: '입찰 금액', type: 'number', required: true },
            ]}
        />
        <InfoDialog
            open={openMinPrice}
            onClose={() => setOpenMinPrice(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>입력한 금액이 최소 입찰 금액과 같거나 더 작습니다.</Typography>
        </InfoDialog>
        <InfoDialog
            open={openMinMyPrice}
            onClose={() => setOpenMinMyPrice(false)}
            confirmText="확인"
        >
            <Typography variant='body2'>입력한 금액이 이전에 제시한 입찰가보다 작습니다.</Typography>
        </InfoDialog>
    </>
    )
}