import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const formVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  exit: { opacity: 0, y: -30, scale: 0.98, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const GlassmorphicCard = styled(Card)(({ theme }) => ({
  minWidth: 380,
  maxWidth: 420,
  overflow: 'hidden',
  borderRadius: '16px',
  background: 'rgba(10, 25, 41, 0.7)', // More bluish background
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(110, 168, 254, 0.2)', // Blueish border
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(110, 168, 254, 0.3)', // Blueish border
    },
    '&:hover fieldset': {
      borderColor: 'rgba(110, 168, 254, 0.6)', // Lighter blueish border on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6ea8fe', // Keep the focused color
    },
    '& input': {
      color: '#e6eefc',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(230, 238, 252, 0.7)', // Lighter label color
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6ea8fe',
  },
}));

const AuthForm = ({ isLogin, handleLogin, handleRegister, authForm, handleInputChange, loading, itemVariants, formVariants }) => (
    <motion.div
      key={isLogin ? 'login' : 'register'}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        <motion.div variants={itemVariants}>
          <Typography variant="h4" mb={3} sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
            {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
          </Typography>
        </motion.div>
        <motion.div variants={itemVariants}>
          <StyledTextField
            label="Kullanıcı Adı"
            name="username"
            value={authForm.username}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
        </motion.div>
        {!isLogin && (
          <motion.div variants={itemVariants}>
            <StyledTextField
              label="Email Adresi"
              name="email"
              type="email"
              value={authForm.email}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          <StyledTextField
            label="Şifre"
            name="password"
            type="password"
            value={authForm.password}
            onChange={handleInputChange}
            variant="outlined"
            margin="normal"
            fullWidth
            required
          />
        </motion.div>
        {!isLogin && (
          <motion.div variants={itemVariants}>
            <StyledTextField
              label="Şifre Tekrar"
              name="password2"
              type="password"
              value={authForm.password2}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
              fullWidth
              required
            />
          </motion.div>
        )}
        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            variant="contained"
            color={isLogin ? 'primary' : 'secondary'}
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 'bold',
                 background: isLogin ? 'linear-gradient(135deg,#3d82ff, #6ea8fe)' : 'linear-gradient(135deg,#9c27b0, #ce93d8)',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );

export function Auth({ onLogin, onRegister, loading, error, setError }) {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
  });

  const handleInputChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    onLogin(authForm.username, authForm.password);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    onRegister(authForm.username, authForm.password, authForm.password2, authForm.email);
  };

  const switchMode = () => {
    setAuthMode((prevMode) => (prevMode === 'login' ? 'register' : 'login'));
    setError('');
    setAuthForm({ username: '', password: '', password2: '', email: '' });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={2}
      sx={{
        background:
          'radial-gradient(1200px 600px at 10% -10%, #1b2650 0%, transparent 60%), radial-gradient(1200px 600px at 110% 10%, #1a2d52 0%, transparent 60%), #0b1020',
        backgroundAttachment: 'fixed',
      }}
    >
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: 'white', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Not Defteri
        </Typography>
      </motion.div>

      <GlassmorphicCard>
        <CardContent sx={{ p: 4 }}>
          <AnimatePresence mode="wait">
            {authMode === 'login' ? <AuthForm isLogin handleLogin={handleLogin} handleInputChange={handleInputChange} authForm={authForm} loading={loading} itemVariants={itemVariants} formVariants={formVariants} /> : <AuthForm isLogin={false} handleRegister={handleRegister} handleInputChange={handleInputChange} authForm={authForm} loading={loading} itemVariants={itemVariants} formVariants={formVariants} />}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: '8px' }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={switchMode}
              disabled={loading}
              sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}
            >
              {authMode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Hesabın var mı? Giriş yap'}
            </Link>
          </Box>
        </CardContent>
      </GlassmorphicCard>
    </Box>
  );
}