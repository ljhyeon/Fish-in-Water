// /theme.js
import { createTheme } from '@mui/material/styles';
import { indigo, amber, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      light: indigo[300], // indigo-300
      main: indigo[500],  // indigo-500
      dark: indigo[900],  // indigo-900
      contrastText: grey[50],
    },
    secondary: {
      light: amber[200], // amber-200
      main: amber[500],  // amber-500
      dark: amber[600],  // amber-600
      contrastText: grey[900],
    },
    grey: {
      50: grey[50],    // grey-50 (white)
      300: grey[300],   // grey-300 (light grey)
      500: grey[500],   // grey-500 (grey)
      700: grey[700],   // grey-700 (dark grey)
      900: grey[900],   // grey-900 (black)
    },
  },
  typography: {
    fontFamily: [
        'Pretendard',
        '-apple-system',
        'BlinkMacSystemFont',
        'system-ui',
        'Roboto',
        'Helvetica Neue',
        'Segoe UI',
        'Apple SD Gothic Neo',
        'Noto Sans KR',
        'Malgun Gothic',
        'sans-serif'
    ].join(','),
    // Headline 5
    h5: {
      fontWeight: 400, // Regular
      fontSize: '24px',
      lineHeight: 1.2,
    },
    // Body 1
    body1: {
      fontWeight: 400, // Regular
      fontSize: '16px',
      lineHeight: 1.5,
    },
    // Body 2
    body2: {
      fontWeight: 400, // Regular
      fontSize: '14px',
      lineHeight: 1.25,
    },
    // Button
    button: {
      fontWeight: 500, // Medium
      fontSize: '14px',
      lineHeight: 1.25,
      textTransform: 'none', // 이미 components에서 설정했으므로 여기서도 통일
    },
    // Caption
    caption: {
      fontWeight: 400, // Regular
      fontSize: '12px',
      lineHeight: 1.4,
    },
    // Overline
    overline: {
      fontWeight: 400, // Regular
      fontSize: '10px',
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
    },
  },
  // 컴포넌트별 기본 스타일 커스터마이징
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: ({ theme, }) => ({
            color: theme.palette.primary.light,
            backgroundColor: indigo[500],
            '&.Mui-selected': {
                color: theme.palette.primary.contrastText,
            },
            '& .MuiBottomNavigationAction-label': {
            ...theme.typography.caption, // caption 스타일 통째로 가져오기
            marginTop: 4,
            color: 'inherit',  // 부모 색상 상속
                '&.Mui-selected': {
                color: 'inherit',  // 선택 시 부모 색상 상속
                },
            },
            // 선택 시 생기는 아웃라인 없애기
            '&.Mui-selected, &:focus-visible': {
                outline: 'none',
                boxShadow: 'none',
            },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          ...theme.typography.button,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&:disabled': {
            // MUI 기본 contained disabled 스타일 유지
          },
        }),
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.primary.contrastText,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          ...theme.typography.button,
          '&:hover': {
            backgroundColor: theme.palette.grey[300],
            borderColor: theme.palette.primary.main,
          },
          '&:disabled': {
            // MUI 기본 outlined disabled 스타일 유지
          },
        }),
      },
    },
  },
});

export default theme;