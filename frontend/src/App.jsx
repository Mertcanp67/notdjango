import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NotesList } from './NotesList'; 
import { CopKutusu } from './CopKutusu';
import './App.css'; 
export default function App() {
  const [view, setView] = useState('main');
  
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshNotes = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const switchToMainView = () => {
    setView('main');
    refreshNotes();
  };

  const switchToTrashView = () => {
    setView('trash');
  };

  return (
    <div className="app-container">
      {view === 'main' ? (
        <>
          <header className="app-header">
            <h1>Notlarım</h1>
            {/* Çöp Kutusuna gitmek için buton */}
            <button className="btn" onClick={switchToTrashView}>
              Çöp Kutusu
            </button>
          </header>
          {/* 
            NotesList bileşeniniz, notları listeler ve bir notu çöpe atma işlevini
            çağırabilmelidir. `onNoteTrashed` prop'u ile listenin yenilenmesini sağlıyoruz.
            `key` prop'u, bileşenin yeniden yüklenmesini ve verileri tekrar çekmesini tetikler.
          */}
          <NotesList 
            key={refreshKey} 
            onNoteTrashed={refreshNotes} 
          />
        </>
      ) : (
        <CopKutusu 
          onSwitchToMainView={switchToMainView} 
          onNoteRestored={refreshNotes} 
        />
      )}
    </div>
  );
}
