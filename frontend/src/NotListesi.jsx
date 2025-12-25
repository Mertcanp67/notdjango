import React from 'react';
import NotKarti from './NotKarti.jsx';
import { Grid } from '@mui/material';

const NotListesi = ({ notes, onNoteSelect, onNoteDelete, onTagClick, onTogglePin, onDragStart, onDragOver, onDrop }) => {
  if (!notes || notes.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
        <h3>Henüz not yok.</h3>
        <p>Yeni bir not ekleyerek başlayın!</p>
      </div>
    );
  }

  return (
    // 1. Grid sistemini kuruyoruz.
    // 'container' prop'u bu Grid'in bir sarmalayıcı olduğunu belirtir.
    // 'spacing={3}' ise item'lar arasına boşluk ekler (3 * 8px = 24px).
    <Grid container spacing={3} style={{ padding: '24px' }}>
      {notes.map(note => (
        <Grid key={note.id} xs={12} sm={6} lg={4}>
          <NotKarti
            note={note}
            onSelect={onNoteSelect}
            onDelete={onNoteDelete}
            onTagClick={onTagClick}
            onTogglePin={onTogglePin}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default NotListesi;