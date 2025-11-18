import React from 'react';

export function Toolbar({ search, setSearch, onAddNoteClick }) {
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

      <div style={{ marginBottom: 20 }}>
        <button className="btn primary" onClick={onAddNoteClick} style={{ width: '100%', padding: '15px', fontSize: '1.2em' }}>
          + Yeni Not Ekle
        </button>
      </div>
    </>
  );
}