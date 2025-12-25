import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, IconButton, TextField, Box,
  Stack, Tooltip, CircularProgress, InputAdornment, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export const KategoriYonetimiModal = ({ isOpen, onClose, categories, onCreate, onUpdate, onDelete }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#808080');
  const [editingCategory, setEditingCategory] = useState(null); // { id, name, color }
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [loading, setLoading] = useState({ create: false, update: null, delete: null });

  useEffect(() => {
    if (!isOpen) {
      setNewCategoryName('');
      setNewCategoryColor('#808080');
      setEditingCategory(null);
      setLoading({ create: false, update: null, delete: null });
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(prev => ({ ...prev, create: true }));
    await onCreate({ name: newCategoryName, color: newCategoryColor });
    setNewCategoryName('');
    setNewCategoryColor('#808080');
    setLoading(prev => ({ ...prev, create: false }));
  };

  const handleStartEdit = (category) => {
    setEditingCategory({ ...category });
  };

  const handleUpdate = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    setLoading(prev => ({ ...prev, update: editingCategory.id }));
    await onUpdate(editingCategory.id, { name: editingCategory.name, color: editingCategory.color });
    setEditingCategory(null);
    setLoading(prev => ({ ...prev, update: null }));
  };

  const handleDeleteRequest = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setLoading(prev => ({ ...prev, delete: deleteConfirm.id }));
    await onDelete(deleteConfirm.id);
    setDeleteConfirm({ open: false, id: null, name: '' });
    // Loading state, ana bileşendeki kategori listesi güncellendiğinde sıfırlanacak.
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Kategorileri Yönet</DialogTitle>
        <DialogContent dividers>
          <List>
            {categories.map(cat => (
              <ListItem key={cat.id} divider>
                {editingCategory?.id === cat.id ? (
                  <Stack direction="row" spacing={1} alignItems="center" width="100%">
                    <input type="color" value={editingCategory.color} onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })} style={{ width: '40px', height: '30px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }} />
                    <TextField variant="standard" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} sx={{ flexGrow: 1 }} autoFocus />
                    <Tooltip title="Kaydet">
                      <IconButton onClick={handleUpdate} disabled={loading.update === cat.id}>
                        {loading.update === cat.id ? <CircularProgress size={20} /> : <SaveIcon color="primary" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="İptal">
                      <IconButton onClick={() => setEditingCategory(null)}>
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : (
                  <>
                    <ListItemText primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 500 }}>
                        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: cat.color, border: '1px solid var(--border)' }} />
                        {cat.name}
                      </Box>
                    } />
                    <Tooltip title="Düzenle">
                      <IconButton edge="end" onClick={() => handleStartEdit(cat)}><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton edge="end" onClick={() => handleDeleteRequest(cat.id, cat.name)} disabled={loading.delete === cat.id} sx={{ ml: 1 }}>
                        {loading.delete === cat.id ? <CircularProgress size={20} /> : <DeleteIcon color="error" />}
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </ListItem>
            ))}
          </List>

          <Box component="form" onSubmit={handleCreate} sx={{ mt: 3, p: 2, border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
            <Typography variant="subtitle1" gutterBottom>Yeni Kategori Ekle</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Kategori Adı" variant="outlined" size="small" value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)} fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <input type="color" value={newCategoryColor} onChange={(e) => setNewCategoryColor(e.target.value)} style={{ width: '24px', height: '24px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, marginRight: '8px' }} />
                    </InputAdornment>
                  )
                }}
              />
              <Button type="submit" variant="contained" startIcon={<AddCircleOutlineIcon />} disabled={loading.create || !newCategoryName.trim()}>
                {loading.create ? <CircularProgress size={20} color="inherit" /> : 'Ekle'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}>
        <DialogTitle>Kategoriyi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "<strong>{deleteConfirm.name}</strong>" kategorisini silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu kategoriye ait notlar kategorisiz olarak işaretlenecektir. Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}>Vazgeç</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Evet, Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};