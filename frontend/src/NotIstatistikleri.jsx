import React from 'react';

export function NoteStats({ notes, categories = [], activeFilter, handleFilterClick }) {
  return (
    <div style={{ position: 'sticky', top: '20px', alignSelf: 'start', zIndex: 1 }}>
      <div className="card stat-dashboard" style={{ marginBottom: '20px', padding: '15px' }}>
        <h3 style={{ margin: '0 0 10px', color: 'var(--primary)', borderBottom: '1px solid var(--muted)', paddingBottom: 5, fontSize: '1.2em' }}>
          📊 Not İstatistikleri
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', marginBottom: 15, paddingBottom: 5, borderBottom: '1px dotted var(--muted)' }}>
          <div>Toplam: <span style={{ color: 'var(--info)' }}>{notes.length}</span></div>
          <div>Gizli: <span style={{ color: 'var(--danger)' }}>{notes.filter(n => n.is_private).length}</span></div>
          <div>Açık: <span style={{ color: 'var(--success)' }}>{notes.filter(n => !n.is_private).length}</span></div>
        </div>

        <div style={{ marginTop: 10 }}>
          {categories.map(cat => {
            const notesInCategory = notes.filter(n => n.category?.id === cat.id);
            const total = notesInCategory.length;
            if (total === 0) return null; // Kategoride not yoksa gösterme

            const publicCount = notesInCategory.filter(n => !n.is_private).length;
            const privateCount = total - publicCount;

            const isSelected = activeFilter === cat.id;
            const itemClass = `stat-item ${isSelected ? 'selected' : ''}`;

            return (
              <div
                key={cat.id}
                className={itemClass}
                onClick={() => handleFilterClick(cat.id)}
                style={{ marginBottom: 8, padding: '8px 5px', borderRadius: '5px' }}
              >
                <div style={{ fontWeight: 'bold', color: cat.color, flexGrow: 1, fontSize: '0.95em' }}>
                  {cat.name.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--text)' }}>
                  ({publicCount} A {privateCount} G)
                </div>
                <div style={{ fontSize: '1em', fontWeight: 'bold', marginLeft: 15 }}>
                  {total}
                </div>
              </div>
            );
          })}
          {/* TODO: Kategori Yönetim Butonu buraya eklenebilir */}
        </div>
      </div>
    </div>
  );
}