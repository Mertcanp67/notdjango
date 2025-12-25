import React, { useState } from 'react';
import { CategoryMap } from "./sabitler.jsx";
import ReactMarkdown from 'react-markdown';
import { Button, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const EditableNoteComponent = React.forwardRef(({ note, onStartEdit, onDelete, currentUser, isAdmin, animationDelay, extraClassName, ...props }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
  
    const handleDeleteWithAnimation = () => {
      setIsDeleting(true);
      setShowConfirm(false);
  
      setTimeout(() => {
        onDelete(note.id);
      }, 400); // CSS'deki .deleting animasyon süresiyle eşleşmelidir
    };

    const handleCloseConfirm = () => {
      setShowConfirm(false);
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
                <Tooltip title="Düzenle">
                  <IconButton size="small" onClick={() => onStartEdit(note)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sil">
                  <IconButton size="small" onClick={() => setShowConfirm(true)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button variant="text" size="small" disabled>
                ⛔ Erişim Yok
              </Button>
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
  
      <Dialog
        open={showConfirm}
        onClose={handleCloseConfirm}
        PaperProps={{
          sx: {
            borderRadius: 'var(--radius)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--text)'
          }
        }}
      >
        <DialogTitle>Notu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--muted)' }}>
            Bu notu kalıcı olarak silmek istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseConfirm} sx={{ color: 'var(--muted)' }}>Vazgeç</Button>
          <Button onClick={handleDeleteWithAnimation} color="error" variant="contained" autoFocus>
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
      </li>
    );
});

export const EditableNote = React.memo(EditableNoteComponent);
