import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

const StatSection = ({ title, children }) => (
  <div className="sidebar-section">
    <h3 className="sidebar-section-title">
      {title}
    </h3>
    {children}
  </div>
);

export function NoteStats({ notes, tags = [], onTagClick, selectedTag }) {
  return (
    <>
      <StatSection title="📊 Not İstatistikleri">
        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', fontSize: '0.9em' }}>
          <div>Toplam: <span style={{ color: 'var(--primary-strong)', fontSize: '1.2em' }}>{notes.length}</span></div>
          <div>Gizli: <span style={{ color: 'var(--danger)', fontSize: '1.2em' }}>{notes.filter(n => n.is_private).length}</span></div>
          <div>Açık: <span style={{ color: 'var(--success)', fontSize: '1.2em' }}>{notes.filter(n => !n.is_private).length}</span></div>
        </div>
      </StatSection>

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