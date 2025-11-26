import React from 'react';

const StatCard = ({ title, children }) => (
  <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
    <h3 style={{ margin: '0 0 15px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: 10, fontSize: '1.1em' }}>
      {title}
    </h3>
    {children}
  </div>
);

const Tag = ({ tag, onClick, isSelected }) => (
  <button
    className={`etiket ${isSelected ? 'active' : ''}`}
    onClick={onClick}
  >
    {tag}
  </button>
);

export function NoteStats({ notes, categories = [], tags = [], onTagClick, selectedTag }) {
  return (
    <div style={{ position: 'sticky', top: '20px', alignSelf: 'start', zIndex: 1 }}>
      <StatCard title="📊 Not İstatistikleri">
        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', fontSize: '0.9em' }}>
          <div>Toplam: <span style={{ color: 'var(--primary-strong)', fontSize: '1.2em' }}>{notes.length}</span></div>
          <div>Gizli: <span style={{ color: 'var(--danger)', fontSize: '1.2em' }}>{notes.filter(n => n.is_private).length}</span></div>
          <div>Açık: <span style={{ color: 'var(--success)', fontSize: '1.2em' }}>{notes.filter(n => !n.is_private).length}</span></div>
        </div>
      </StatCard>

      {categories.length > 0 && (
        <StatCard title="🗂️ Kategoriler">
          <div style={{ marginTop: 10 }}>
            {categories.map(cat => {
              const total = notes.filter(n => n.category?.id === cat.id).length;
              if (total === 0) return null;

              return (
                <div
                  key={cat.id}
                  className={`stat-item`}
                  // onClick={() => handleFilterClick(cat.id)}
                >
                  <div style={{ fontWeight: 'bold', color: cat.color, flexGrow: 1 }}>{cat.name}</div>
                  <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{total}</div>
                </div>
              );
            })}
          </div>
        </StatCard>
      )}

      {tags.length > 0 && (
        <StatCard title="🏷️ Etiketler">
          <div className="etiket-listesi">
            <Tag
              tag="Tümü"
              onClick={() => onTagClick(null)}
              isSelected={!selectedTag}
            />
            {tags.map((tag) => (              
              <Tag
                key={tag.name}
                tag={`${tag.name} (${tag.count})`}
                onClick={() => onTagClick(tag.name)}
                isSelected={selectedTag === tag.name}
              />
            ))}
          </div>
        </StatCard>
      )}
    </div>
  );
}