import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NotesList } from './NotesList'; // Ana not listesi bileşeniniz (varsayımsal)
import { CopKutusu } from './CopKutusu';
import './App.css'; // Genel stiller için bir CSS dosyası ekleyebilirsiniz

export default function App() {
  // 'main' (ana liste) ve 'trash' (çöp kutusu) arasında geçiş yapacak state
  const [view, setView] = useState('main');
  
  // Not listesini yenilemek için bir state. 
  // Bu değeri değiştirdiğinizde NotesList yeniden veri çeker.
  const [refreshKey, setRefreshKey] = useState(0);

  // Not listesini yenileme fonksiyonu
  const refreshNotes = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  // Ana görünüme dönmek için CopKutusu bileşenine verilecek fonksiyon
  const switchToMainView = () => {
    setView('main');
    // Ana listeye dönerken notların güncel halini görmek için listeyi yenileyebiliriz.
    refreshNotes();
  };

  // Çöp kutusu görünümüne geçmek için fonksiyon
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
          onNoteRestored={refreshNotes} // Not geri yüklendiğinde ana listeyi yenile
        />
      )}
    </div>
  );
}

// Stil için App.css dosyası oluşturabilirsiniz
/* 
  // c:/Users/Mertcan/Desktop/notdjango/frontend/src/App.css

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

*/