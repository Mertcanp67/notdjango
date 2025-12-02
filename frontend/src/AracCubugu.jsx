import React from 'react';

export function Toolbar({ search, setSearch, onAddNoteClick, onSwitchToTrashView }) {
  return (
    <>
      <form className="toolbar card" style={{ padding: 15, marginBottom: 20 }}>
        <input
          className="input"
          placeholder="Ara (başlık / içerik)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn ghost" type="button" onClick={() => setSearch("")}>
          Temizle
        </button>
      </form>

      <div style={{ marginBottom: 20, display: 'flex', gap: '1rem' }}>
        <button className="btn primary" onClick={onAddNoteClick} style={{ flex: 1, padding: '15px', fontSize: '1.2em' }}>
          + Yeni Not Ekle
        </button>
        <button className="btn secondary" onClick={onSwitchToTrashView} style={{ flex: 1 }}>
          🗑️ Çöp Kutusu
        </button>
      </div>
    </>
  );
}