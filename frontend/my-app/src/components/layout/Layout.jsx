import { useState, } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { AuctionIcon, Properties, Info, FishLogo } from './Icons';

export function Layout({ description, children }) {
    const theme = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    // 현재 경로에 맞춰 value 상태 초기화
    // navItems value와 path 매핑을 해두고 location.pathname 기반으로 value 세팅
    const pathToValueMap = {
        '/auction': 'auctions',
        '/home': 'properties',
        '/myinfo': 'info',
    };

    const [value, setValue] = useState(pathToValueMap[location.pathname] || 'properties');

    const handleChange = (event, newValue) => {
        setValue(newValue);

        // value에 따라 경로로 이동
        switch (newValue) {
        case 'auctions':
            navigate('/auction');
            break;
        case 'properties':
            navigate('/home');
            break;
        case 'info':
            navigate('/myinfo');
            break;
        default:
            break;
        }
    };

    const navItems = [
        {
            label: '경매 현황',
            value: 'auctions',
            icon: AuctionIcon,
        },
        {
            label: '매물 현황',
            value: 'properties',
            icon: Properties,
        },
        {
            label: '내 정보',
            value: 'info',
            icon: Info,
        },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* 상단바 영역 - 고정 위치 */}
            <AppBar position="fixed">
                <Toolbar sx={{ display: 'grid', justifyItems: 'center', minHeight: '100px !important', }}>
                    <FishLogo />
                    <Box sx={{ mb:1, width: '100%', height: '16px' }}>{description}</Box>
                </Toolbar>
            </AppBar>

            {/* 메인 컨텐츠 영역 */}
            <Box sx={{ 
                pt: '102px', // 상단바 높이(100px) + 여유공간(16px)
                pb: '56px',  // 하단 네비게이션 높이
                overflow: 'auto', // 스크롤 가능
            }}>
                {children}
            </Box>
            
            {/* 하단 네비게이션 - 고정 위치 */}
            <BottomNavigation
            sx={{
                width: '100%',
                position: 'fixed',
                bottom: 0,
                borderTop: 1,
                borderColor: 'divider',
            }}
            value={value}
            onChange={handleChange}
            showLabels
            >
            {navItems.map(({ label, value: itemValue, icon: Icon }) => {
                const selected = value === itemValue;
                const iconColor = selected
                ? theme.palette.secondary.main
                : theme.palette.primary.light;

                return (
                <BottomNavigationAction
                    key={itemValue}
                    label={label}
                    value={itemValue}
                    icon={<Icon selected={selected} color={iconColor} />}
                />
                );
            })}
            </BottomNavigation>
        </Box>
    )
}