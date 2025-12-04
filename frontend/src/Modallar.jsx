import React, { useState, useEffect } from 'react';
import { TagInput } from './TagInput';
import { generateAITags } from './api'; 

const AITagButton = ({ onClick, isLoading }) => (
  <div className="ai-tag-button-container">
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="ai-tag-button"
    >
      {isLoading ? (
        <>⏳ Analiz Ediliyor...</>
      ) : (
        <>✨ Yapay Zeka ile Etiketle</>
      )}
    </button>
  </div>
);

const NoteModal = ({ isOpen, isClosing, onClose, onSave, initialData, loading, title }) => {
  const [noteData, setNoteData] = useState(initialData);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNoteData(initialData);
    }
  }, [isOpen, initialData]);

  const handleAITagging = async () => {
    if (!noteData.title && !noteData.content) {
      alert("Yapay zeka analizi için lütfen önce bir Başlık veya İçerik girin.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await generateAITags({ title: noteData.title, content: noteData.content });
      const currentTags = noteData.tags || [];
      const newTags = [...new Set([...currentTags, ...res.tags])];
      setNoteData(prev => ({ ...prev, tags: newTags }));
    } catch (error) {
      console.error("AI Hatası:", error);
      alert("Etiket üretilemedi. Lütfen tekrar deneyin.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (newTags) => {
    setNoteData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSave = () => {
    onSave(noteData);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
        <div className="modal-body">
          <h2 className="modal-title">{title}</h2>
          <input
            className="input"
            name="title"
            placeholder="Başlık"
            value={noteData.title}
            onChange={handleChange}
          />
          <textarea
            className="textarea"
            name="content"
            placeholder="İçerik (opsiyonel)"
            rows={6}
            value={noteData.content || ""}
            onChange={handleChange}
          />

          <AITagButton onClick={handleAITagging} isLoading={aiLoading} />

          <TagInput tags={noteData.tags || []} setTags={handleTagsChange} />

          <div className="private-note-container" style={{ border: noteData.is_private ? '1px solid #1abc9c' : '1px solid transparent' }}>
            <input
              type="checkbox"
              id={`isPrivate-${noteData.id || 'new'}`}
              name="is_private"
              checked={noteData.is_private}
              onChange={handleChange}
              className="private-note-checkbox"
            />
            <label htmlFor={`isPrivate-${noteData.id || 'new'}`} className="private-note-label" style={{ color: noteData.is_private ? '#1abc9c' : '#ccc' }}>
              🔒 Bu notu sadece ben göreyim (Gizli Yap)
            </label>
          </div>

          <div className="modal-actions">
            <button
              className="btn primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {noteData.id ? 'Kaydediliyor...' : 'Ekleniyor...'}
                </>
              ) : (
                noteData.id ? 'Değişiklikleri Kaydet' : 'Ekle'
              )}
            </button>
            <button className="btn secondary" onClick={onClose}>
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddNoteModal = ({ isOpen, onClose, onAdd, loading, isClosing, form, setForm }) => (
  <NoteModal
    isOpen={isOpen}
    isClosing={isClosing}
    onClose={onClose}
    onSave={onAdd}
    initialData={form}
    loading={loading}
    title="Yeni Not Oluştur"
  />
);

export const EditNoteModal = ({ isOpen, onClose, onSave, loading, isClosing, note, setNote }) => {
  if (!note) return null;
  return (
    <NoteModal
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={onClose}
      onSave={(updatedNote) => {
        setNote(updatedNote); // Önce lokal state'i güncelle
        onSave(); // Sonra kaydetme işlemini tetikle
      }}
      initialData={note}
      loading={loading}
      title="Notu Düzenle"
    />
  );
};