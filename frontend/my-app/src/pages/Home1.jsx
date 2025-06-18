import * as React from 'react';
import { Box, List, Divider, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuctionItem from '../components/AuctionItem';
import { getAuctions } from '../services/auctionService';
import { NonData } from '../components/NonData';

export function Home1() {
    const navigate = useNavigate();
    const [auctions, setAuctions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // 임시 추천글 배열
    const recommendationTexts = [
        "신선한 바다의 맛을 느껴보세요!",
        "오늘의 특가 상품이에요!",
        "품질 좋은 수산물을 만나보세요!",
        "지금이 기회! 놓치지 마세요!",
        "어부가 직접 잡은 신선한 해산물!",
        "맛과 영양이 가득한 바다의 선물!",
        "한정 수량! 서둘러 주세요!",
        "최고 품질의 수산물을 경험하세요!"
    ];

    React.useEffect(() => {
        fetchAuctions();
    }, []);

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            // ACTIVE 상태의 경매들을 가져옵니다
            const auctionData = await getAuctions('ACTIVE', 20);
            
            // 각 경매에 임시 추천글 추가 (recommend가 없는 경우에만)
            const auctionsWithRecommendation = auctionData.map((auction, index) => ({
                ...auction,
                recommend: auction.recommend || recommendationTexts[index % recommendationTexts.length]
            }));
            
            setAuctions(auctionsWithRecommendation);
        } catch (err) {
            console.error('경매 데이터 로딩 실패:', err);
            // 오류가 발생해도 빈 배열로 설정하여 "진행중인 경매가 없어요" 메시지 표시
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%' 
                }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (!auctions || auctions.length === 0) {
            return (
                <NonData>
                    현재 진행중인 경매가 없어요!
                </NonData>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper', height: '100%' }}>
                {auctions.map((auction, index) => (
                    <React.Fragment key={auction.id}>
                        <AuctionItem 
                            item={auction}
                            pageType="home1"
                            onClick={() => navigate(`/info1/${auction.id}`)}
                        />
                        {index < auctions.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', width: "100%", height: "100%" }}>
            {renderContent()}
        </Box>
    );
}