import { Container, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home1 } from './pages/Home1';
import { Home2 } from './pages/Home2';
import { Home3 } from './pages/Home3';
import { Login } from './pages/Login';
import { Info1 } from './pages/Info1';
import { Info2 } from './pages/Info2';
import { Post } from './pages/Post';
import theme from './theme';

// Layout이 필요없는 페이지들
const noLayoutPages = ['/login'];

// 페이지별 description 정의
const pageDescriptions = {
  '/home': (
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500,
        textAlign: 'center',
        flex: 1
      }}
    >
      지금 진행 중인 경매들이에요
    </Typography>
  ),
  '/auction': (
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'white', 
        fontWeight: 500,
        textAlign: 'center',
        flex: 1
      }}
    >
      지금 진행 중인 경매들이에요
    </Typography>
  ),
  '/myinfo': null, // 내 정보 페이지는 description 없음
};

function AppContent() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  // 현재 경로의 description 가져오기
  const currentDescription = pageDescriptions[location.pathname] || null;

  const content = (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home1 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/auction" 
        element={
          <ProtectedRoute>
            <Home2 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/myinfo" 
        element={
          <ProtectedRoute>
            <Home3 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/info1/:id" 
        element={
          <ProtectedRoute>
            <Info1 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/info2/:id" 
        element={
          <ProtectedRoute>
            <Info2 />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/post/:id" 
        element={
          <ProtectedRoute>
            <Post />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );

  if (shouldShowLayout) {
    return (
      <Layout description={currentDescription}>
        <Container sx={{ mt: 2, mb: 2 }}>
          {content}
        </Container>
      </Layout>
    );
  }

  return content;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;