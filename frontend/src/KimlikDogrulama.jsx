import React, { useState, useMemo } from 'react';
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
  ToggleButtonGroup,
  ToggleButton,
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
  // Etiket küçüldüğünde (yani içine yazı yazıldığında) arkaplan ekleyelim
  '& .MuiInputLabel-shrink': {
    background: 'radial-gradient(circle, rgba(10, 25, 41, 1) 60%, transparent 65%)',
    paddingRight: '4px',
    paddingLeft: '4px',
  },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  background: 'rgba(110, 168, 254, 0.1)',
  border: '1px solid rgba(110, 168, 254, 0.2)',
  borderRadius: '12px',
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flex: 1,
  border: 'none',
  color: 'rgba(230, 238, 252, 0.6)',
  fontWeight: 'bold',
  borderRadius: '12px !important',
  '&.Mui-selected': {
    color: '#ffffff',
    background: 'rgba(110, 168, 254, 0.3)',
  },
  '&:hover': {
    background: 'rgba(110, 168, 254, 0.2)',
  },
}));

export function Auth({ onLogin, onRegister, loading, error, setError, successMessage, isSuccessVisible }) {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
  });

  const isLogin = useMemo(() => authMode === 'login', [authMode]);

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

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setAuthMode(newMode);
    }
    setError('');
    setAuthForm({ username: '', password: '', password2: '', email: '' });
  };

  const renderForm = () => (
    <motion.div
      key={authMode}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
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
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 'bold',
              background: isLogin
                ? 'linear-gradient(135deg,#3d82ff, #6ea8fe)'
                : 'linear-gradient(135deg,#9c27b0, #ce93d8)',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );

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
          <StyledToggleButtonGroup
            value={authMode}
            exclusive
            onChange={handleModeChange}
            aria-label="auth mode"
            fullWidth
          >
            <StyledToggleButton value="login" aria-label="login">Giriş Yap</StyledToggleButton>
            <StyledToggleButton value="register" aria-label="register">Kayıt Ol</StyledToggleButton>
          </StyledToggleButtonGroup>
          <AnimatePresence mode="wait">
            {renderForm()}
          </AnimatePresence>

          {isSuccessVisible && successMessage && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Alert severity="success" sx={{ mt: 2, width: '100%', borderRadius: '8px' }}>
                {successMessage}
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: '8px' }}>
                {error}
              </Alert>
            </motion.div>
          )}
        </CardContent>
      </GlassmorphicCard>
    </Box>
  );
}