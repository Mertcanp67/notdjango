import React, { useState } from 'react';
import { CategoryMap } from "./sabitler.jsx";

// Etiketlere tutarlı ama rastgele renkler atamak için bir yardımcı fonksiyon
const stringToHslColor = (str, s, l) => {
  if (!str) return `hsl(0, 0%, 80%)`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const EditableNoteComponent = React.forwardRef(({ note, onStartEdit, onTrash, onTagClick, currentUser, isAdmin, animationDelay, extraClassName, ...props }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [isClosingConfirm, setIsClosingConfirm] = useState(false); 
  
    const handleTrashWithAnimation = () => {
      setIsDeleting(true); 
      setShowConfirm(false);
  
      setTimeout(() => {
        onTrash(note.id);
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
                  Çöpe Taşı
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
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: note.content }} />
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="note-tags">
            {note.tags.map((tag, index) => (
              <button
                key={index}
                className="note-tag"
                onClick={() => onTagClick(tag)}
                style={{
                  backgroundColor: stringToHslColor(tag, 50, 30),
                  color: stringToHslColor(tag, 50, 85)
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
  
      {showConfirm && (
          <div className={`delete-confirm-overlay ${isClosingConfirm ? 'closing' : ''}`}>
            <div className={`delete-confirm-box ${isClosingConfirm ? 'closing' : ''}`}>
                <p>Bu notu çöpe taşımak istediğinize emin misiniz?</p>
                <div className="note-actions">
                    <button className="btn danger" onClick={handleTrashWithAnimation}>
                        Evet, Taşı
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

export const EditableNote = React.memo(EditableNoteComponent);