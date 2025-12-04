import React, { useState } from 'react';
import { TagInput } from './TagInput';
import { generateAITags } from './api'; 

export function AddNoteModal({ isOpen, onClose, form, setForm, onAdd, loading, isClosing, allTags = [] }) {
  const [aiLoading, setAiLoading] = useState(false);

  const handleAITagging = async () => {
    if (!form.title && !form.content) {
      alert("Yapay zeka analizi için lütfen önce bir Başlık veya İçerik girin.");
      return;
    }

    setAiLoading(true);
    try {
      const res = await generateAITags({ title: form.title, content: form.content });
      
      const currentTags = form.tags || [];
      const newTags = [...new Set([...currentTags, ...res.tags])];
      
      setForm({ ...form, tags: newTags });
      
    } catch (error) {
      console.error("AI Hatası:", error);
      alert("Etiket üretilemedi. Lütfen tekrar deneyin.");
    } finally {
      setAiLoading(false);
    }
  };

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

          {/* --- YAPAY ZEKA BUTONU --- */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px', marginTop: '5px' }}>
            <button
              type="button" // Formu submit etmemesi için şart
              onClick={handleAITagging}
              disabled={aiLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Mor geçişli renk
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.85em',
                cursor: aiLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s'
              }}
            >
              {aiLoading ? (
                <>⏳ Analiz Ediliyor...</>
              ) : (
                <>✨ Yapay Zeka ile Etiketle</>
              )}
            </button>
          </div>
          {/* ------------------------- */}

          <TagInput tags={form.tags || []} setTags={(newTags) => setForm({ ...form, tags: newTags })} />

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

export function EditNoteModal({ isOpen, onClose, note, setNote, onSave, loading, isClosing, allTags = [] }) {
  const [aiLoading, setAiLoading] = useState(false);

  const handleAITagging = async () => {
    if (!note.title && !note.content) {
      alert("Yapay zeka analizi için lütfen önce bir Başlık veya İçerik girin.");
      return;
    }

    setAiLoading(true);
    try {
      const res = await generateAITags({ title: note.title, content: note.content });
      
      const currentTags = note.tags || [];
      const newTags = [...new Set([...currentTags, ...res.tags])];
      
      setNote({ ...note, tags: newTags });
      
    } catch (error) {
      console.error("AI Hatası:", error);
      alert("Etiket üretilemedi. Lütfen tekrar deneyin.");
    } finally {
      setAiLoading(false);
    }
  };

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

          {/* --- YAPAY ZEKA BUTONU (Edit Modal) --- */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px', marginTop: '5px' }}>
            <button
              type="button"
              onClick={handleAITagging}
              disabled={aiLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.85em',
                cursor: aiLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s'
              }}
            >
              {aiLoading ? (
                <>⏳ Analiz Ediliyor...</>
              ) : (
                <>✨ Yapay Zeka ile Etiketle</>
              )}
            </button>
          </div>
          {/* -------------------------------------- */}

          <TagInput tags={note.tags || []} setTags={(newTags) => setNote({ ...note, tags: newTags })} />

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