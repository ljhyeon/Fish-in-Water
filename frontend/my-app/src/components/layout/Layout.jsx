import { useState, } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Box, BottomNavigation, BottomNavigationAction, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { AuctionIcon, Properties, Info, FishLogo } from './Icons';
import LogoutConfirmDialog from '../LogoutConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';

export function Layout({ description, children }) {
    const theme = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    // 인증 관련 hooks
    const { signOut } = useAuth();
    const { completeLogout } = useAuthStore();

    // 현재 경로에 맞춰 value 상태 초기화
    // navItems value와 path 매핑을 해두고 location.pathname 기반으로 value 세팅
    const pathToValueMap = {
        '/auction': 'auctions',
        '/home': 'properties',
        '/myinfo': 'info',
    };

    const [value, setValue] = useState(pathToValueMap[location.pathname] || 'properties');
    
    // 로그아웃 모달 상태
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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

    // 물고기 로고 클릭 핸들러
    const handleLogoClick = () => {
        setIsLogoutDialogOpen(true);
    };

    // 로그아웃 확인 핸들러
    const handleLogoutConfirm = async () => {
        try {
            // 1. Firebase 로그아웃
            await signOut();
            
            // 2. 완전한 데이터 삭제 (zustand, localStorage, sessionStorage, cache)
            completeLogout();
            
            // 3. 로그인 페이지로 이동
            navigate('/login');
            
            // 4. 모달 닫기
            setIsLogoutDialogOpen(false);
            
            console.log('🔥 완전한 로그아웃 처리 완료');
        } catch (error) {
            console.error('❌ 로그아웃 처리 중 오류:', error);
            // 오류가 발생해도 강제로 로그아웃 처리
            completeLogout();
            navigate('/login');
            setIsLogoutDialogOpen(false);
        }
    };

    // 로그아웃 취소 핸들러
    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
            {/* 상단바 영역 - 고정 위치 */}
            <AppBar position="fixed">
                <Toolbar sx={{ display: 'grid', justifyItems: 'center', minHeight: '100px !important', }}>
                    <IconButton
                        onClick={handleLogoClick}
                        sx={{ 
                            p: 0, 
                            '&:hover': { 
                                backgroundColor: 'transparent',
                                transform: 'scale(1.05)'
                            },
                            transition: 'transform 0.2s ease-in-out'
                        }}
                    >
                        <FishLogo />
                    </IconButton>
                    <Box sx={{ mb:1, width: '100%', height: '16px' }}>{description}</Box>
                </Toolbar>
            </AppBar>

            {/* 메인 컨텐츠 영역 */}
            <Box sx={{ 
                flex: 1, // 남은 공간을 모두 차지
                marginTop: '102px', // 상단바 높이만큼 마진
                marginBottom: '80px', // 하단 네비게이션 높이만큼 마진
                overflow: 'auto', // 스크롤 가능
                minHeight: 0, // flexbox에서 overflow 작동을 위해 필요
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
                height: '80px',
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

            {/* 로그아웃 확인 모달 */}
            <LogoutConfirmDialog
                open={isLogoutDialogOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />
        </Box>
    )
}