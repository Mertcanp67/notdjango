import React from 'react';
import { Chip, Box, IconButton, Tooltip, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const StatSection = ({ title, children }) => (
  <div className="sidebar-section">
    <h3 className="sidebar-section-title">
      {title}
    </h3>
    {children}
  </div>
);

export function NoteStats({ notes, categories = [], tags = [], onTagClick, selectedTag, onManageCategories }) {
  return (
    <>
      <StatSection title="📊 Not İstatistikleri">
        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', fontSize: '0.9em' }}>
          <div>Toplam: <span style={{ color: 'var(--primary-strong)', fontSize: '1.2em' }}>{notes.length}</span></div>
          <div>Gizli: <span style={{ color: 'var(--danger)', fontSize: '1.2em' }}>{notes.filter(n => n.is_private).length}</span></div>
          <div>Açık: <span style={{ color: 'var(--success)', fontSize: '1.2em' }}>{notes.filter(n => !n.is_private).length}</span></div>
        </div>
      </StatSection>

      {categories.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h3" sx={{fontSize: '1em', fontWeight: 'bold'}}>🗂️ Kategoriler</Typography>
            <Tooltip title="Kategorileri Yönet">
              <IconButton size="small" onClick={onManageCategories} sx={{mr: -1}}>
                <SettingsIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </div>

          <div style={{ marginTop: 10, maxHeight: '200px', overflowY: 'auto' }}>
            {categories.map(cat => {
              const total = notes.filter(n => n.category?.id === cat.id).length;
              if (total === 0) return null;

              return (
                <div key={cat.id} className={`stat-item`}>
                  <div style={{ fontWeight: 'bold', color: cat.color, flexGrow: 1 }}>{cat.name}</div>
                  <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <StatSection title="🏷️ Etiketler">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '200px', overflowY: 'auto', pt: 1 }}>
            <Chip
              label="Tümü"
              onClick={() => onTagClick(null)}
              variant={!selectedTag ? 'filled' : 'outlined'}
              color="primary"
              size="small"
              clickable
            />
            {tags.map((tag) => (              
              <Chip
                key={tag.name}
                label={`${tag.name} (${tag.count})`}
                onClick={() => onTagClick(tag.name)}
                variant={selectedTag === tag.name ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                clickable
              />
            ))}
          </Box>
        </StatSection>
      )}
    </>
  );
}