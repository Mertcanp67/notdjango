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
      <div className={`modal-content modal-note-editor zen-mode ${isClosing ? 'closing' : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Kapat">
            &times;
          </button>
        </div>
        <div className="modal-body zen-body">
          <input
            className="note-editor-title"
            name="title"
            placeholder="Başlık"
            value={noteData.title}
            onChange={handleChange}
            autoFocus
          />
          <textarea
            className="note-editor-content"
            name="content"
            placeholder="Notunuzu buraya yazın..."
            rows={8}
            value={noteData.content || ""}
            onChange={handleChange}
          />
        </div>
        <div className="modal-footer">
          <div className="note-editor-tools">
            <div className="tag-section">
              <TagInput tags={noteData.tags || []} setTags={handleTagsChange} />
              <AITagButton onClick={handleAITagging} isLoading={aiLoading} />
            </div>
            <div className="privacy-toggle-container">
              <label htmlFor={`isPrivate-${noteData.id || 'new'}`} className="privacy-toggle-label">
                {noteData.is_private ? '🔒 Gizli' : '🌐 Herkese Açık'}
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  id={`isPrivate-${noteData.id || 'new'}`}
                  name="is_private"
                  checked={noteData.is_private}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn secondary" onClick={onClose}>Vazgeç</button>
            <button className="btn primary" onClick={handleSave} disabled={loading || !noteData.title.trim()}>
              {loading ? <><div className="spinner"></div>Kaydediliyor...</> : '💾 Kaydet'}
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
    onSave={(noteData) => onAdd(noteData)}
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
        if (setNote) setNote(updatedNote); // Önce lokal state'i güncelle
        onSave(updatedNote); // Sonra kaydetme işlemini tetikle, güncellenmiş notu geçir
      }}
      initialData={note}
      loading={loading}
      title="Notu Düzenle"
    />
  );
};