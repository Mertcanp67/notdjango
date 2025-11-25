import React, { useState } from 'react';
import { CategoryMap } from "./sabitler.jsx";
import ReactMarkdown from 'react-markdown';
const EditableNoteComponent = React.forwardRef(({ note, onStartEdit, onDelete, currentUser, isAdmin, animationDelay, extraClassName, ...props }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isClosingConfirm, setIsClosingConfirm] = useState(false);
  
    const handleDeleteWithAnimation = () => {
      setIsDeleting(true);
      setShowConfirm(false);
  
      setTimeout(() => {
        onDelete(note.id);
      }, 400);
    };

    const handleCloseConfirm = () => {
      setIsClosingConfirm(true);
      setTimeout(() => {
        setShowConfirm(false);
        setIsClosingConfirm(false);
      }, 300);
    }
  
    const isOwner = note.owner.toLowerCase() === currentUser.toLowerCase(); 
    
    const canEditOrDelete = isOwner || isAdmin; 
  
    const currentCategory = CategoryMap[note.category] || CategoryMap.GEN;
  
  
    return (
      <li 
        ref={ref}
        {...props}
        className={`note-card ${isDeleting ? 'deleting' : ''} ${extraClassName}`}
        style={{ 
          animationDelay: `${animationDelay}ms`, borderLeft: `5px solid ${currentCategory.color}`
        }}
      >
        <div className="note-head">
          <div style={{ display: "grid", gap: 4, flex: 1 }}>
                <span style={{ 
                    fontSize: '0.8em',
                    fontWeight: 'bold', 
                    color: currentCategory.color 
                }}>
                    {currentCategory.label}
  </span>
              <h3 className="note-title">{note.title}</h3>
              <span className="note-date">
                {note.is_private ? '🔒 Gizli Not | ' : '🌐 Herkese Açık | '}
                @{note.owner || "Anonim"} •{" "}
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
  
          <div className="note-actions">
            {canEditOrDelete ? ( 
              <>
                <button className="btn secondary" onClick={() => onStartEdit(note)}>
                    Düzenle
                  </button>
                <button className="btn danger" onClick={() => setShowConfirm(true)}>
                  Sil
                </button>
              </>
            ) : (
              <button className="btn ghost" disabled>
                ⛔ Yetkiniz yok
              </button>
            )}
          </div>
        </div>
  
        <div style={{ marginTop: 12 }}>
          {note.content && (
            <div className="markdown-content">
              <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
                {note.tags.map(tag => (
                    <span key={tag} className="etiket">
            {tag}
          </span>
                ))}
            </div>
        )}
  
      {showConfirm && (
          <div className={`delete-confirm-overlay ${isClosingConfirm ? 'closing' : ''}`}>
            <div className={`delete-confirm-box ${isClosingConfirm ? 'closing' : ''}`}>
                <p>Bu notu kalıcı olarak silmek istediğinize emin misiniz?</p>
                <div className="note-actions">
                    <button className="btn danger" onClick={handleDeleteWithAnimation}>
                        Evet, Sil
                    </button>
                    <button className="btn secondary" onClick={handleCloseConfirm}>
                        Vazgeç
                    </button>
                </div>
            </div>
          </div>
      )}
      </li>
    );
});

// Performans için bileşeni memoize edelim.
export const EditableNote = React.memo(EditableNoteComponent);
