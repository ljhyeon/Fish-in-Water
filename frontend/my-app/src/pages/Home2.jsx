import * as React from 'react';
import { Box, Typography, List, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { testItems } from '../data/testItems';
import AuctionItem from '../components/AuctionItem';

export function Home2() {
    const navigate = useNavigate();
    const [hasItems, setHasItems] = React.useState(true);

    // 현재 진행 중이고 내가 입찰한 경매만 필터링
    const filteredItems = testItems.filter(item => {
        const isOngoing = item.status.consumer === '진행중';
        const hasBid = item.currentPrice !== null; // 입찰 여부는 currentPrice가 있는지로 판단
        return isOngoing && hasBid;
    });

    React.useEffect(() => {
        setHasItems(filteredItems.length > 0);
    }, [filteredItems]);

    const renderContent = () => {
        if (!hasItems) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px', 
                    gap: 2 
                }}>
                    <img src="/non_fish.svg" style={{ width: '300px', height: 'auto' }} />
                    <Typography variant="body1" color="text.secondary">
                        참여중인 경매가 없어요! 경매에 참여해보세요.
                    </Typography>
                </Box>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {filteredItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <AuctionItem 
                            item={item}
                            pageType="home2"
                            onClick={() => navigate(`/info1/${item.id}`)}
                        />
                        {index < filteredItems.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        );
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', width: "100%" }}>
            {renderContent()}
        </Box>
    );
}