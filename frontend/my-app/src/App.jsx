import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AppBar, Toolbar, Button, Container, Avatar, Box, Typography } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  const { user, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My PWA App
          </Typography>
          
          {isAuthenticated && (
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
          )}
          
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user?.photoURL} 
                alt={user?.displayName}
                sx={{ width: 32, height: 32 }}
              />
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.displayName || user?.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                로그아웃
              </Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              로그인
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
