import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Button, Typography } from "@mui/material"

import { ImageWithBackButton } from '../components/info/ImageWithBackButton';
import { ProductInfoReadOnly } from '../components/info/ProductInfoReadOnly';
import InfoDialog from '../components/InfoDialog';
import { LoadingOverlay } from '../components/Spinner';

import { testItems } from '../data/testItems';

export function Info2() {
    const navigate = useNavigate();

    const isUserSeller = false; // 낙찰자인지 판매자인지 구분 필요 (false: 낙찰자, true: 판매자)

    const { id } = useParams();

    const dummyData = testItems.find(item => item.id === parseInt(id)); // 백 연결에 따라 변경 필요

    // const dummyData = {
    //     image_urls: "data:image/jpeg;base64,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",
    //     product_name: '고양이',
    //     recommend: '요즘 제철인 상품이에요! 평소보다 가격이 저렴해요!',
    //     origin: '제주도',
    //     auction_start_time: '2025-06-12T14:30',
    //     auction_end_time: '2025-06-12T16:30',
    //     expected_price: 10000,
    //     seller: '**수산',
    //     additional_notes: '오늘 먹은 물고기 냐미',
    // }

    const [isLoading, setIsLoading] = useState(false);

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

    const [open, setOpen] = useState(false);


    return (
        <>
            <LoadingOverlay  isVisible={isLoading}  message="결제 페이지로 이동"  />
            <Box sx={{width:'100%', height: '100%'}}>
                {/* 매물 이미지 */}
                <ImageWithBackButton 
                    src={dummyData.image} 
                    onBackClick={() => navigate(-1)}  // 뒤로 가기 버튼 기능
                />
    
                {/* 매물 정보 */}
                <ProductInfoReadOnly dummyData={dummyData} />
                
                {/* 하단 버튼 */}
                {dummyData.finalPrice && 
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                        <Button variant="contained" onClick={handleButton}>
                            {isUserSeller ? "낙찰자 정보 확인" : "결제"}
                        </Button>
                    </Box>
                }
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
                        100,000 원
                    </Typography>
                </Box>
                </Box>
            </InfoDialog>
        </>
    )
}