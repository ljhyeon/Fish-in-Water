import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Layout } from './components/layout/Layout';
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

function AppContent() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);

  const content = (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home1 />} />
      <Route path="/auction" element={<Home2 />} />
      <Route path="/myinfo" element={<Home3 />} />
      <Route path="/info1/:id" element={<Info1 />} />
      <Route path="/info2/:id" element={<Info2 />} />
      <Route path="/post/:id" element={<Post />} />
    </Routes>
  );

  if (shouldShowLayout) {
    return (
      <Layout>
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