import { useState, } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { AuctionIcon, Properties, Info } from './Icons';

export function Layout({ children }) {
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
            {/* 메인 컨텐츠 영역 */}
            <Box sx={{ flex: 1, pb: 7 }}> {/* pb: 하단 네비게이션 공간 확보 */}
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