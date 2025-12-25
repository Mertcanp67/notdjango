import React from 'react';
import { Button, Box, Typography, IconButton, TextField } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddIcon from '@mui/icons-material/Add';

export function Header({ 
  currentUser, 
  theme, 
  onToggleTheme, 
  search, 
  setSearch, 
  onAddNoteClick 
}) {
  return (
    <Box className="content-header">
      <Typography variant="h6">Hoş geldin, {currentUser}!</Typography>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 'auto' }}>
        <TextField
          placeholder="Notlarda ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button variant="contained" onClick={onAddNoteClick} startIcon={<AddIcon />}>Yeni Not Ekle</Button>
        <IconButton onClick={onToggleTheme} color="inherit">
          {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Box>
    </Box>
  );
}