import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Collapse,
  Link,
  IconButton
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export function Auth({ onSubmit, loading, error, setError, successMessage, isSuccessVisible, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  // Mod değiştiğinde formu ve hataları temizle
  useEffect(() => {
    setForm({ username: '', email: '', password: '', password2: '' });
    if (error) setError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModeChange = (event, newMode) => {
    if (newMode) {
      setMode(newMode);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(mode, form);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          borderRadius: 'var(--radius)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <IconButton
          onClick={onToggleTheme}
          sx={{ position: 'absolute', top: 16, right: 16 }}
          color="inherit"
        >
          {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <span role="img" aria-label="notebook" style={{fontSize: '1.2em'}}>🗒️</span>
          Özel Not Defteri
        </Typography>
        <Typography component="p" variant="subtitle1" sx={{ color: 'var(--muted)', mb: 3, textAlign: 'center' }}>
          {mode === 'login' ? 'Devam etmek için giriş yapın' : 'Saniyeler içinde yeni bir hesap oluşturun'}
        </Typography>

        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={mode}
            onChange={handleModeChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab value="login" label="Giriş Yap" />
            <Tab value="register" label="Kayıt Ol" />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Collapse in={isSuccessVisible || !!error} sx={{ width: '100%', mb: 2 }}>
                {isSuccessVisible && (
                    <Alert severity="success" sx={{mb: !!error ? 2 : 0}}>
                        {successMessage}
                        <Link href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }} sx={{fontWeight: 'bold', ml: 1}}>Şimdi giriş yapın.</Link>
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
            </Collapse>

          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Kullanıcı Adı"
            name="username"
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={handleChange}
          />
          {mode === 'register' && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Şifre"
            type="password"
            id="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={handleChange}
          />
          {mode === 'register' && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="password2"
              label="Şifre (Tekrar)"
              type="password"
              id="password2"
              autoComplete="new-password"
              value={form.password2}
              onChange={handleChange}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}