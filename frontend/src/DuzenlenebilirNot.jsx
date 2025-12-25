import React, { useState } from 'react';
import { CategoryMap } from "./sabitler.jsx";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Chip, Tooltip, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { shareNote } from './api.js';

const unescapeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const EditableNoteComponent = React.forwardRef(({ note, onStartEdit, onTrash, onTagClick, onSave, currentUser, isAdmin, animationDelay, extraClassName, ...props }, ref) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 
    const [isClosingConfirm, setIsClosingConfirm] = useState(false);
    const [shareableLink, setShareableLink] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

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

    const handleStartEdit = () => {
      if (typeof onStartEdit !== 'function') {
        console.error('EditableNote: `onStartEdit` prop eksik veya bir fonksiyon değil.');
        return;
      }
      onStartEdit(note);
    };

    const handleShare = async () => {
      try {
        const updatedNote = await shareNote(note.id);
        if (updatedNote.is_public) {
          const link = `${window.location.origin}/share/${updatedNote.share_uuid}`;
          setShareableLink(link);
        } else {
          setShareableLink(null);
        }
      } catch (error) {
        console.error("Failed to share note:", error);
      }
    };
  
    const copyToClipboard = () => {
      navigator.clipboard.writeText(shareableLink).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    };

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
        <div className="note-content-wrapper">
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
                <div className="note-meta">
                  <span>@{note.owner || "Anonim"}</span>
                  <span>{note.is_public ? '🌐 Herkese Açık' : '🔒 Gizli Not'}</span>
                </div>
              </div>
    
            <div className="note-actions">
              {canEditOrDelete ? ( 
                <>
                  <Tooltip title="Paylaş">
                    <IconButton size="small" onClick={handleShare}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Düzenle">
                    <IconButton size="small" onClick={handleStartEdit}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Çöpe Taşı">
                    <IconButton size="small" onClick={() => setShowConfirm(true)} sx={{ color: 'var(--danger)' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Button variant="text" disabled>
                  ⛔ Erişim Yok
                </Button>
              )}
            </div>
          </div>

          {shareableLink && (
            <Box sx={{ mt: 2, p: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={shareableLink}
                readOnly
                label="Paylaşılabilir Bağlantı"
              />
              <Tooltip title={isCopied ? "Kopyalandı!" : "Kopyala"}>
                <IconButton onClick={copyToClipboard}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
    
          <div className="note-content-preview">
            {note.content && (
              <div className="ql-editor" dangerouslySetInnerHTML={{ __html: unescapeHtml(note.content) }} />
            )}
          </div>
        </div>

        <div className="note-footer">
            <span className="note-date">
              {new Date(note.created_at).toLocaleString()}
            </span>
            {note.tags && note.tags.length > 0 && (
              <Box className="note-tags" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
                {note.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag.replace(/^#/, '')}`}
                    onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
                    size="small"
                    variant="outlined"
                    color="primary"
                    clickable
                  />
                ))}
              </Box>
            )}
        </div>
  
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
        <DialogTitle id="alert-dialog-title">Notu Çöpe Taşı</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: 'var(--muted)' }}>
            Bu notu çöpe taşımak istediğinize emin misiniz? Çöp kutusundan geri getirebilirsiniz.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleCloseConfirm} sx={{ color: 'var(--muted)' }}>Vazgeç</Button>
          <Button 
            onClick={handleTrashWithAnimation} 
            color="error" 
            variant="contained" 
            autoFocus>
            Evet, Taşı
          </Button>
        </DialogActions>
      </Dialog>
      </li>
    );
});

EditableNoteComponent.displayName = 'EditableNoteComponent';

export const EditableNote = React.memo(EditableNoteComponent);