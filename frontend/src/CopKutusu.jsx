import React, { useState, useEffect, useCallback } from 'react';
import { listTrashedNotes, restoreNote, deleteNotePermanently } from './api';
import { Spinner } from 'react-bootstrap';

// Basit bir not kartı bileşeni
const TrashedNoteCard = ({ note, onRestore, onDelete }) => (
  <li className="note-card">
    <div className="note-head">
      <div style={{ display: "grid", gap: 4, flex: 1 }}>
        <h3 className="note-title" style={{textDecoration: 'line-through'}}>{note.title}</h3>
        <span className="note-date">
          @{note.owner || "Anonim"} •{" "}
          {new Date(note.created_at).toLocaleString()}
        </span>
      </div>
      <div className="note-actions">
        <button className="btn primary" onClick={() => onRestore(note.id)}>Geri Getir</button>
        <button className="btn danger" onClick={() => onDelete(note.id)}>Kalıcı Olarak Sil</button>
      </div>
    </div>
  </li>
);


export function CopKutusu({ onSwitchToMainView, onNoteRestored }) {
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTrashedNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const notes = await listTrashedNotes();
      setTrashedNotes(notes);
    } catch (err) {
      setError('Çöpteki notlar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrashedNotes();
  }, [loadTrashedNotes]);

  const handleRestore = async (id) => {
    try {
      await restoreNote(id);
      setTrashedNotes(prev => prev.filter(n => n.id !== id));
      onNoteRestored(); // Ana listeyi yenilemesi için üst bileşeni bilgilendir
    } catch (err) {
      setError('Not geri getirilemedi: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu notu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await deleteNotePermanently(id);
        setTrashedNotes(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        setError('Not kalıcı olarak silinemedi: ' + err.message);
      }
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Çöp Kutusu</h2>
        <button className="btn secondary" onClick={onSwitchToMainView}>&larr; Geri</button>
      </div>
      
      {loading && <div style={{textAlign: 'center'}}><Spinner animation="border" /></div>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && trashedNotes.length === 0 && <p>Çöp kutunuz boş.</p>}
      
      <ul style={{listStyle: 'none', padding: 0}}>
        {trashedNotes.map(note => (
          <TrashedNoteCard 
            key={note.id} 
            note={note} 
            onRestore={handleRestore} 
            onDelete={handleDelete} 
          />
        ))}
      </ul>
    </div>
  );
}
