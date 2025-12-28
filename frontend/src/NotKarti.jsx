import React, { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import './stil.css';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { 
  IconButton, Tooltip, Menu, MenuItem, 
  ListItemIcon, ListItemText 
} from '@mui/material';

const unescapeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const NotKarti = ({ note, onSelect, onDelete, onTogglePin, onTagClick, onDragStart, onDragOver, onDrop }) => {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.MuiChip-root')) {
        return;
    }
    onSelect(note);
  };

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handlePinClick = (e) => {
    onTogglePin(note.id);
    handleMenuClose(e);
  };

  const handleDeleteClick = (e) => {
    onDelete(note.id);
    handleMenuClose(e);
  };


  const getSafeDate = (formatString) => {
    try {
      const date = new Date(note.created_at);
      if (isNaN(date.getTime())) return ''; // Geçersiz tarih kontrolü
      return format(date, formatString, { locale: tr });
    } catch (error) {
      console.error("Tarih formatlama hatası:", error);
      return '';
    }
  };

  const displayDate = getSafeDate("dd.MM.yyyy HH:mm"); // İsteğine göre yeni format: 26.12.2023 15:30
  const tooltipDate = getSafeDate("d MMMM yyyy, HH:mm"); // Tooltip için uzun format

  return (
    <li
      className={`note-card-modern ${note.is_pinned ? 'pinned' : ''}`}
      onClick={handleCardClick}
      draggable={!note.is_pinned}
      onDragStart={(e) => onDragStart(e, note.id)}
      onDragOver={(e) => onDragOver(e, note.id)}
      onDrop={(e) => onDrop(e, note.id)}
    >
      {/* Aksiyon Butonları (Üç Nokta Menüsü) */}
      <div className="note-actions-floating">
        <Tooltip title="Seçenekler" placement="top">
          <IconButton
            aria-label="seçenekler"
            onClick={handleMenuClick}
            className="action-btn"
            size="small"
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{ className: 'note-card-menu-paper' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handlePinClick}>
          <ListItemIcon><PushPinIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{note.is_pinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} className="menu-item-danger">
          <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

      {/* İçerik Alanı */}
      <div className="note-body">
        <h3 className="note-title-modern">{note.title}</h3>
        <div className="note-preview-modern">
            {note.content && (
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: unescapeHtml(note.content) }} />
            )}
        </div>
      </div>

      {/* Footer: Kategori, Tarih ve Etiketler */}
      <div className="note-footer-modern">
        <div className="footer-left">
            {/* Yazar bilgisi (eğer varsa) */}
            {note.author_username && ( // Yazar bilgisi, avatar ve @kullanıcıadı formatında
                <>
                    <Tooltip title={`Notun sahibi: ${note.author_username}`} placement="top">
                        <div className="author-info">
                            <div className="author-avatar">{note.author_username.charAt(0).toUpperCase()}</div>
                            <span className="author-name">@{note.author_username}</span>
                        </div>
                    </Tooltip>
                    <span className="separator">•</span>
                </>
            )}
            {/* Tarih */}
            <Tooltip title={tooltipDate ? `Oluşturuldu: ${tooltipDate}` : ''} placement="top">
                <span className="date-text">{displayDate}</span>
            </Tooltip>
            <span className="separator">•</span>
            <Tooltip title={note.is_private ? 'Bu not sadece siz ve paylaştığınız kişiler tarafından görülebilir.' : 'Bu not herkese açık.'} placement="top">
                <span className={`privacy-status ${note.is_private ? 'private' : 'public'}`}>
                    {note.is_private ? 'Gizli Not' : 'Herkese Açık'}
                </span>
            </Tooltip>
        </div>

        <div className="footer-right">
          {/* Etiketler (Varsa sağda minik ikon gibi durur) */}
          {note.tags && note.tags.length > 0 && (
            <div className="note-tags-container">
                {note.tags.slice(0, 2).map(tag => ( // En fazla 2 etiket göster, taşmasın
                    <span
                        key={tag}
                        className="note-tag-item"
                        onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default NotKarti;