import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

const formVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

export const LoginForm = ({ handleLogin, handleInputChange, authForm, loading }) => (
  <motion.div
    key="login"
    variants={formVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    <form onSubmit={handleLogin}>
      <Typography variant="h5" mb={2} sx={{ fontWeight: 'medium' }}>
        Giriş Yap
      </Typography>
      <TextField
        label="Kullanıcı Adı veya Email"
        name="username"
        value={authForm.username}
        onChange={handleInputChange}
        variant="outlined"
        margin="normal"
        fullWidth
        required
      />
      <TextField
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
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
      </Button>
    </form>
  </motion.div>
);

export const RegisterForm = ({ handleRegister, handleInputChange, authForm, loading }) => (
    <motion.div
      key="register"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleRegister}>
        <Typography variant="h5" mb={2} sx={{ fontWeight: 'medium' }}>
          Kayıt Ol
        </Typography>
        <TextField
          label="Kullanıcı Adı"
          name="username"
          value={authForm.username}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
          fullWidth
          required
        />
        <TextField
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
        <TextField
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
        <TextField
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
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
        </Button>
      </form>
    </motion.div>
  );