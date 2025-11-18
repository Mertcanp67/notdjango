import React from 'react';
import { CATEGORY_CHOICES, CategoryMap } from './sabitler.jsx';

export function NoteStats({ notes, categoryStats, activeFilter, filteredNotes, handleFilterClick }) {
  return (
    <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
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
          {CATEGORY_CHOICES.map(cat => {
            const stats = categoryStats[cat.value] || { total: 0, private: 0, public: 0 };
            const categoryData = CategoryMap[cat.value] || CategoryMap.GEN;
            const isSelected = activeFilter === cat.value;
            const hasNotesInCurrentFilter = activeFilter ? filteredNotes.some(n => n.category === cat.value) : stats.total > 0;

            const itemClass = `stat-item ${isSelected ? 'selected' : ''} ${!hasNotesInCurrentFilter ? 'filtered-out' : ''}`;

            return (
              <div
                key={cat.value}
                className={itemClass}
                onClick={stats.total > 0 ? () => handleFilterClick(cat.value) : null}
                style={{ marginBottom: 8, padding: '8px 5px', borderRadius: '5px' }}
              >
                <div style={{ fontWeight: 'bold', color: categoryData.color, flexGrow: 1, fontSize: '0.95em' }}>
                  {categoryData.label}
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--text)' }}>
                  ({stats.public} A {stats.private} G)
                </div>
                <div style={{ fontSize: '1em', fontWeight: 'bold', marginLeft: 15 }}>
                  {stats.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}