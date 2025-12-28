import React from 'react';
import NotKarti from './NotKarti.jsx';

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
    <ul className="notes-grid" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
      {notes.map((note, index) => (
          <NotKarti
            key={note.id}
            note={note}
            animationDelay={index * 50} /* Kademeli animasyon için gecikme */
            onSelect={onNoteSelect}
            onDelete={onNoteDelete}
            onTagClick={onTagClick}
            onTogglePin={onTogglePin}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
      ))}
    </ul>
  );
};

export default NotListesi;