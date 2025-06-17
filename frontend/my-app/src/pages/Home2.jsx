import { useState, useEffect } from 'react';
import { Box, Typography, List, Divider, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuctionItem from '../components/AuctionItem';
import { useAuth } from '../hooks/useAuth';
import { useUserAuctions } from '../hooks/useAuction';

export function Home2() {
    const navigate = useNavigate();
    const { user, userInfo, isAuthenticated } = useAuth();
    
    // 사용자가 참여한 경매 데이터 조회
    const { auctions: participatedAuctions, loading, error } = useUserAuctions('bidder');

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

    // 에러가 있을 때
    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    경매 목록을 불러오는데 실패했습니다.
                </Typography>
                <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
                    다시 시도
                </Button>
            </Box>
        );
    }

    const renderContent = () => {
        if (!participatedAuctions || participatedAuctions.length === 0) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '85vh', 
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
                {participatedAuctions.map((item, index) => (
                    <Box key={item.id}>
                        <AuctionItem 
                            item={item}
                            pageType="home2"
                            onClick={() => navigate(`/info1/${item.id}`)}
                        />
                        {index < participatedAuctions.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
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