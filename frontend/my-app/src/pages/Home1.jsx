import * as React from 'react';
import { Box, Typography, List, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { testItems } from '../data/testItems';
import AuctionItem from '../components/AuctionItem';

export function Home1() {
    const navigate = useNavigate();
    const [hasItems, setHasItems] = React.useState(true);

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
                        현재 진행중인 경매가 없어요!
                    </Typography>
                </Box>
            );
        }

        return (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {testItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <AuctionItem 
                            item={item}
                            pageType="home1"
                            onClick={() => navigate(`/info1/${item.id}`)}
                        />
                        {index < testItems.length - 1 && <Divider variant="inset" component="li" />}
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