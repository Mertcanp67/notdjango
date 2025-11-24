import React from 'react';
export function AddNoteModal({ isOpen, onClose, form, setForm, onAdd, loading, isClosing, categories }) {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div style={{ display: 'grid', gap: 14, padding: '25px', width: '100%' }}>
          <h2 style={{ margin: '0 0 10px' }}>Yeni Not Oluştur</h2>
          <input
            className="input"
            placeholder="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ padding: '12px 15px', fontSize: '1.1em' }}
          />
          <textarea
            className="textarea"
            placeholder="İçerik (opsiyonel)"
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={{ padding: '12px 15px', fontSize: '1.05em' }}
          />

          <select
            className="input"
            value={form.category_id || ''}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            style={{ marginTop: '10px', padding: '12px 15px', fontSize: '1.05em' }}
          >
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Etiketler (virgülle ayırın)"
            value={form.tags || ''}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            style={{ marginTop: '10px', padding: '12px 15px', fontSize: '1.05em' }}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            padding: '12px',
            borderRadius: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: form.is_private ? '1px solid #1abc9c' : '1px solid transparent'
          }}>
            <input
              type="checkbox"
              id="isPrivate"
              checked={form.is_private}
              onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
              style={{ marginRight: 10, width: 'auto', transform: 'scale(1.2)' }}
            />
            <label htmlFor="isPrivate" style={{ color: form.is_private ? '#1abc9c' : '#ccc', fontWeight: 'bold', fontSize: '1.05em' }}>
              🔒 Bu notu sadece ben göreyim (Gizli Yap)
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              className="btn primary"
              onClick={onAdd}
              disabled={loading}
              style={{
                flex: 1,
                padding: '15px',
                fontSize: '1.2em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Ekleniyor...
                </>
              ) : (
                'Ekle'
              )}
            </button>
            <button className="btn secondary" onClick={onClose} style={{ flex: 1, fontSize: '1.2em' }}>
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditNoteModal({ isOpen, onClose, note, setNote, onSave, loading, isClosing, categories }) {
  if (!isOpen || !note) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div style={{ display: 'grid', gap: 14, padding: '25px', width: '100%' }}>
          <h2 style={{ margin: '0 0 10px' }}>Notu Düzenle</h2>
          <input
            className="input"
            placeholder="Başlık"
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            style={{ padding: '12px 15px', fontSize: '1.1em' }}
          />
          <textarea
            className="textarea"
            placeholder="İçerik (opsiyonel)"
            rows={6}
            value={note.content || ""}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            style={{ padding: '12px 15px', fontSize: '1.05em' }}
          />

          <select
            className="input"
            value={note.category?.id || ''}
            onChange={(e) => setNote({ ...note, category: categories.find(c => c.id == e.target.value) })}
            style={{ marginTop: '10px', padding: '12px 15px', fontSize: '1.05em' }}
          >
            <option value="">Kategori Seç</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Etiketler (virgülle ayırın)"
            value={Array.isArray(note.tags) ? note.tags.join(', ') : note.tags || ''}
            onChange={(e) => setNote({ ...note, tags: e.target.value })}
            style={{ marginTop: '10px', padding: '12px 15px', fontSize: '1.05em' }}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            padding: '12px',
            borderRadius: '5px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: note.is_private ? '1px solid #1abc9c' : '1px solid transparent'
          }}>
            <input
              type="checkbox"
              id={`private-modal-edit-${note.id}`}
              checked={note.is_private}
              onChange={(e) => setNote({ ...note, is_private: e.target.checked })}
              style={{ marginRight: 10, width: 'auto', transform: 'scale(1.2)' }}
            />
            <label htmlFor={`private-modal-edit-${note.id}`} style={{ color: note.is_private ? '#1abc9c' : '#ccc', fontWeight: 'bold', fontSize: '1.05em' }}>
              🔒 Bu notu sadece ben göreyim (Gizli Yap)
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              className="btn primary"
              onClick={onSave}
              disabled={loading}
              style={{ flex: 1, padding: '15px', fontSize: '1.2em' }}
            >
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <button className="btn secondary" onClick={onClose} style={{ flex: 1, fontSize: '1.2em' }}>
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}