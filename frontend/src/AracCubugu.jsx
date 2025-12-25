import React from 'react';
import { Button, Box, Typography, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { NoteStats } from './NotIstatistikleri';

export function Toolbar({ 
  notes, 
  tags, 
  categories, 
  onTagClick, 
  selectedTag, 
  onSwitchToTrashView,
  currentUser,
  onLogout,
  isAdmin,
  onManageCategories
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <span role="img" aria-label="notebook">🗒️</span>
          Özel Not Defteri
        </Typography>
      </div>

      <div className="sidebar-content">
        <NoteStats 
          notes={notes}
          tags={tags}
          categories={categories}
          onTagClick={onTagClick}
          selectedTag={selectedTag}
          onManageCategories={onManageCategories}
        />
        <Button fullWidth variant="outlined" color="secondary" onClick={onSwitchToTrashView} startIcon={<DeleteIcon />} sx={{ mt: 2 }}>
          Çöp Kutusu
        </Button>
      </div>

      <Box className="sidebar-footer">
        {isAdmin && (
          <Chip icon={<AdminPanelSettingsIcon />} label="Admin" color="error" variant="outlined" size="small" />
        )}
        <Typography sx={{ color: "text.secondary", flexGrow: 1, textAlign: 'center' }}>{currentUser}</Typography>
        <Button variant="text" onClick={onLogout} startIcon={<LogoutIcon />} sx={{ color: 'text.secondary' }}>
          Çıkış
        </Button>
      </Box>
    </div>
  );
}