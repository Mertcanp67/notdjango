import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReactQuill from 'react-quill';

const NotKarti = ({ note, onSelect, onDelete, onTogglePin, onTagClick, onDragStart, onDragOver, onDrop }) => {
  const handleCardClick = () => {
    onSelect(note);
  };

  const stopPropagation = (e) => e.stopPropagation();

  // Tarih formatlama işlemini güvenli hale getiriyoruz.
  // Eğer `note.updated_at` geçerli bir tarih değilse, uygulama çökmez.
  const getSafeDate = () => {
    try {
      return format(new Date(note.updated_at), "dd MMM yyyy", { locale: tr });
    } catch (error) {
      return 'geçersiz tarih'; // Geçersiz tarih için varsayılan bir metin
    }
  };
  const formattedDate = getSafeDate();

  const category = note.category;
  // Kategori veya rengi mevcut değilse varsayılan bir renge geri dön.
  const categoryColor = category?.color || 'var(--primary)';
  const categoryName = category?.name;

  return (
    <div
      className={`note-card ${note.is_pinned ? 'pinned' : ''}`}
      onClick={handleCardClick}
      draggable={!note.is_pinned}
      style={{ borderLeft: `4px solid ${categoryColor}` }}
      onDragStart={(e) => onDragStart(e, note.id)}
      onDragOver={(e) => onDragOver(e, note.id)}
      onDrop={(e) => onDrop(e, note.id)}
    >
      <div className="note-head">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {categoryName && (
            <Typography variant="caption" sx={{ color: categoryColor, fontWeight: 'bold', textTransform: 'uppercase', display: 'block', lineHeight: 1.2 }}>{categoryName}</Typography>
          )}
          <h3 className="note-title">{note.title}</h3>
        </Box>
        <div className="note-actions">
          <IconButton
            size="small"
            onClick={(e) => { stopPropagation(e); onTogglePin(note.id); }}
            title={note.is_pinned ? "Sabitlemeyi Kaldır" : "Üste Sabitle"}
            className="pin-button"
          >
            <PushPinIcon fontSize="small" color={note.is_pinned ? 'primary' : 'inherit'} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => { stopPropagation(e); onDelete(note.id); }}
            title="Çöpe Taşı"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {note.content && (
        <div className="note-content-preview">
          <ReactQuill
            value={note.content}
            readOnly={true}
            theme={"bubble"}
          />
        </div>
      )}

      <div className="note-footer">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {note.tags?.slice(0, 3).map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={(e) => { stopPropagation(e); onTagClick(tag); }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
        <Box sx={{ textAlign: 'right', color: 'text.secondary', lineHeight: 1.3 }}>
          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
            @{note.owner}
          </Typography>
          <Typography variant="caption">{formattedDate}</Typography>
        </Box>
      </div>
    </div>
  );
};

export default NotKarti;