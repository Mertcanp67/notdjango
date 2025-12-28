import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import { TagInput } from './TagInput';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill'in stil dosyasını ekleyin

// Backend'den gelen ve HTML entity'lerine dönüştürülmüş içeriği
// tekrar HTML'e çevirmek için bir yardımcı fonksiyon.
const unescapeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const EMPTY_NOTE = { title: "", content: "", is_private: false, tags: [] };

const NoteModal = ({ isOpen, onClose, onSave, onShare, initialData, loading, title }) => {
  const [noteData, setNoteData] = useState(initialData);

  useEffect(() => {
    if (isOpen) {
      setNoteData({ 
        ...initialData, 
        content: unescapeHtml(initialData.content || ''),
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setNoteData(prev => ({ ...prev, content }));
  };

  const handleTagsChange = (newTags) => {
    setNoteData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSave = () => {
    onSave(noteData);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        component: 'form',
        onSubmit: (e) => { e.preventDefault(); handleSave(); },
        sx: {
          borderRadius: '16px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--text)',
          height: '90vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid var(--border)', pb: 1.5 }}>
        <Typography variant="h6" component="span">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'var(--muted)',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        <TextField
          name="title"
          placeholder="Başlık"
          value={noteData.title || ''}
          onChange={handleChange}
          autoFocus
          variant="standard"
          InputProps={{ disableUnderline: true, sx: { fontSize: '1.5rem', fontWeight: '600' } }}
        />
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', '& .ql-container': { flexGrow: 1, overflow: 'auto' } }}>
            <ReactQuill
              theme="snow"
              className="note-editor-content"
              value={noteData.content || ""}
              onChange={handleContentChange}
              placeholder="Notunuzu buraya yazın..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
        <TagInput tags={noteData.tags || []} setTags={handleTagsChange} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={<Switch checked={noteData.is_private || false} onChange={handleChange} name="is_private" />}
              label={noteData.is_private ? '🔒 Gizli Not' : '🌐 Herkese Açık'}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            {initialData.id && (
              <Button 
                startIcon={<ShareIcon />} 
                onClick={() => onShare(noteData)}
                variant={noteData.is_shared ? "outlined" : "text"}
              >
                {noteData.is_shared ? "Paylaşılıyor" : "Paylaş"}
              </Button>
            )}
            <Button onClick={onClose} sx={{ color: 'var(--muted)' }}>Vazgeç</Button>
            <Button type="submit" variant="contained" disabled={loading || !noteData.title?.trim()}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Kaydet'}
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export const AddNoteModal = ({ isOpen, onClose, onAdd, loading }) => (
  <NoteModal
    isOpen={isOpen}
    onClose={onClose}
    onSave={onAdd}
    initialData={EMPTY_NOTE}
    loading={loading}
    title="Yeni Not Oluştur"
  />
);

export const EditNoteModal = ({ isOpen, onClose, onSave, onShare, loading, note }) => {
  if (!note) return null;
  return (
    <NoteModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      onShare={onShare}
      initialData={note}
      loading={loading}
      title="Notu Düzenle"
    />
  );
};

export const ShareModal = ({ isOpen, onClose, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notu Paylaş</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Bu linke sahip olan herkes notu görüntüleyebilir.
        </Typography>
        <TextField
          fullWidth
          readOnly
          value={shareUrl}
          variant="outlined"
          size="small"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy} startIcon={<ContentCopyIcon />}>
          {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
        </Button>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};