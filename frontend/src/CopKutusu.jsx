import React, { useState, useEffect, useCallback } from 'react';
import { listTrashedNotes, restoreNote, deleteNotePermanently, emptyAllTrash, restoreAllTrash } from './api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SearchIcon from '@mui/icons-material/Search';

// Bileşenler arası tutarlılık için Alert'i tanımlıyoruz.
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Backend'in sayfa başına döndürdüğü not sayısını burada sabit olarak tanımlamak,
// sayfa sayısını hesaplamayı daha güvenilir ve bakımı kolay hale getirir.
const PAGE_SIZE = 10; // Bu değeri backend'deki pagination ayarınızla eşleştirin.

const TrashedNoteCard = ({ note, onRestore, onDelete }) => {
  // Notun ne zaman silindiğini ve ne zaman otomatik olarak silineceğini hesaplıyoruz.
  const deletionDate = new Date(note.updated_at);
  const autoDeleteDate = new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 gün ekle
  const daysLeft = Math.ceil((autoDeleteDate - new Date()) / (1000 * 60 * 60 * 24));
  const daysLeftText =
    daysLeft > 1
      ? `${daysLeft} gün içinde silinecek`
      : daysLeft === 1
      ? 'Yarın silinecek'
      : 'Bugün silinecek';

  return (
    <Paper
      component="li"
      elevation={2}
      sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none' }}
    >
      <Box>
        <Typography variant="h6" sx={{ textDecoration: 'line-through' }}>
          {note.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Silinme: {deletionDate.toLocaleString()}
        </Typography>
        {daysLeft > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'warning.dark' }}>
            <AutoDeleteIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {daysLeftText}
            </Typography>
          </Box>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<RestoreFromTrashIcon />} onClick={() => onRestore(note.id)}>
          Geri Getir
        </Button>
        <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={() => onDelete(note.id)}>
          Kalıcı Olarak Sil
        </Button>
      </Stack>
    </Paper>
  );
};

export function CopKutusu({ onSwitchToMainView, onNoteRestored }) {
  // --- STATE YÖNETİMİ ---
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('-updated_at');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Sayfalama state'leri
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);

  // Onay dialogları için state'ler
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isConfirmEmptyAllOpen, setIsConfirmEmptyAllOpen] = useState(false);
  const [isConfirmRestoreAllOpen, setIsConfirmRestoreAllOpen] = useState(false);

  // --- VERİ ÇEKME ---
  // GÜNCELLENMİŞ KISIM: Hem sayfalı hem sayfasız yapıyı destekler.
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTrashedNotes({ page, search: searchTerm, ordering: sortOrder });
      
      console.log("Çöp Kutusu Verisi:", data); // Konsoldan kontrol edebilirsin

      let notesList = [];
      let totalCount = 0;

      // Backend veri yapısını kontrol ediyoruz
      if (Array.isArray(data)) {
        // Eğer direkt dizi geliyorsa (Pagination kapalıysa)
        notesList = data;
        totalCount = data.length;
      } else if (data && Array.isArray(data.results)) {
         // Eğer { count: ..., results: [...] } geliyorsa (Pagination açıksa)
        notesList = data.results;
        totalCount = data.count;
      }

      setTrashedNotes(notesList);
      setTotalNotes(totalCount);
      
      const newPageCount = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0;
      setPageCount(newPageCount);

      // Eğer mevcut sayfa, silme işleminden sonra geçersiz hale geldiyse, geçerli son sayfaya git.
      if (page > newPageCount && newPageCount > 0) {
        setPage(newPageCount);
      }
    } catch (err) {
      console.error("Fetch Hatası:", err);
      setSnackbar({ open: true, message: 'Çöpteki notlar yüklenemedi: ' + err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, sortOrder]);

  // `fetchData` bağımlılıkları değiştiğinde veriyi yeniden çek.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- AKSİYON HANDLER'LARI (İYİMSER GÜNCELLEME İLE) ---

  const handleRestore = async (id) => {
    const originalNotes = [...trashedNotes];
    setTrashedNotes(prev => prev.filter(note => note.id !== id));

    try {
      await restoreNote(id);
      onNoteRestored(); // Ana bileşeni bilgilendirerek ana not listesini yenilemesini sağla.
      setSnackbar({ open: true, message: 'Not başarıyla geri yüklendi.', severity: 'success' });
      fetchData(); // Sayfalama ve toplam not sayısını güncellemek için veriyi yeniden çek.
    } catch (err) {
      setTrashedNotes(originalNotes);
      setSnackbar({ open: true, message: 'Not geri getirilemedi: ' + err.message, severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;

    const originalNotes = [...trashedNotes];
    const noteIdToDelete = confirmDeleteId;

    setConfirmDeleteId(null);
    setTrashedNotes(prev => prev.filter(note => note.id !== noteIdToDelete));

    try {
      await deleteNotePermanently(noteIdToDelete);
      setSnackbar({ open: true, message: 'Not kalıcı olarak silindi.', severity: 'success' });
      fetchData(); // Sayfalamayı güncellemek için veriyi yeniden çek.
    } catch (err) {
      setTrashedNotes(originalNotes);
      setSnackbar({ open: true, message: 'Not kalıcı olarak silinemedi: ' + err.message, severity: 'error' });
    }
  };

  const handleConfirmEmptyAll = async () => {
    const originalNotes = [...trashedNotes];

    setTrashedNotes([]);
    setTotalNotes(0);
    setPageCount(0);
    setPage(1);
    setIsConfirmEmptyAllOpen(false);

    try {
      await emptyAllTrash();
      setSnackbar({ open: true, message: 'Çöp kutusu başarıyla boşaltıldı.', severity: 'success' });
    } catch (err) {
      setTrashedNotes(originalNotes); // Hata durumunda eski notları geri yükle.
      fetchData(); // Durumu sunucuyla senkronize etmek için yeniden çek.
      setSnackbar({ open: true, message: 'Çöp kutusu boşaltılamadı: ' + err.message, severity: 'error' });
    }
  };

  const handleConfirmRestoreAll = async () => {
    const originalNotes = [...trashedNotes];

    setTrashedNotes([]);
    setTotalNotes(0);
    setPageCount(0);
    setPage(1);
    setIsConfirmRestoreAllOpen(false);

    try {
      await restoreAllTrash();
      onNoteRestored(); // Ana listeyi yenile.
      setSnackbar({ open: true, message: 'Tüm notlar başarıyla geri yüklendi.', severity: 'success' });
    } catch (err) {
      setTrashedNotes(originalNotes); // Hata durumunda eski notları geri yükle.
      fetchData(); // Durumu sunucuyla senkronize et.
      setSnackbar({ open: true, message: 'Tüm notlar geri yüklenemedi: ' + err.message, severity: 'error' });
    }
  };

  // --- YARDIMCI HANDLER'LAR ---

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Arama yapıldığında ilk sayfaya dön.
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setPage(1); // Sıralama değiştiğinde ilk sayfaya dön.
  };

  // --- RENDER ---
  return (
    <Box sx={{ p: 2 }}>
      {/* Başlık ve Ana Aksiyon Butonları */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Ana Sayfaya Dön">
            <IconButton onClick={onSwitchToMainView}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h2">
            Çöp Kutusu
          </Typography>
        </Stack>
        {totalNotes > 0 && !loading && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="success" startIcon={<RestoreFromTrashIcon />} onClick={() => setIsConfirmRestoreAllOpen(true)}>
              Tümünü Geri Yükle
            </Button>
            <Button variant="contained" color="error" startIcon={<AutoDeleteIcon />} onClick={() => setIsConfirmEmptyAllOpen(true)}>
              Çöpü Boşalt
            </Button>
          </Stack>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Yüklenme Durumu */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

      {/* Arama ve Sıralama Kontrolleri */}
      {!loading && totalNotes > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Çöp kutusunda ara..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-by-label">Sırala</InputLabel>
            <Select labelId="sort-by-label" value={sortOrder} label="Sırala" onChange={handleSortChange}>
              <MenuItem value="-updated_at">Silinme Tarihi (En Yeni)</MenuItem>
              <MenuItem value="updated_at">Silinme Tarihi (En Eski)</MenuItem>
              <MenuItem value="title">Başlık (A-Z)</MenuItem>
              <MenuItem value="-title">Başlık (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Not Listesi veya Boş Durum Mesajları */}
      <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
        {!loading &&
          totalNotes > 0 &&
          trashedNotes.map(note => (
            <TrashedNoteCard key={note.id} note={note} onRestore={handleRestore} onDelete={setConfirmDeleteId} />
          ))}
      </Box>

      {!loading && totalNotes === 0 && (
        <Typography sx={{ my: 4, textAlign: 'center', color: 'text.secondary' }}>Çöp kutunuz boş.</Typography>
      )}

      {!loading && totalNotes > 0 && trashedNotes.length === 0 && (
        <Typography sx={{ my: 4, textAlign: 'center', color: 'text.secondary' }}>
          Aramanızla eşleşen not bulunamadı.
        </Typography>
      )}

      {/* Sayfalama */}
      {!loading && pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={pageCount} page={page} onChange={(event, value) => setPage(value)} color="primary" />
        </Box>
      )}

      {/* Onay Dialogları */}
      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle id="alert-dialog-title">Notu Kalıcı Olarak Sil</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu notu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Vazgeç</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Evet, Kalıcı Olarak Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmEmptyAllOpen} onClose={() => setIsConfirmEmptyAllOpen(false)}>
        <DialogTitle>Çöp Kutusunu Boşalt</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Çöp kutusundaki <strong>tüm notları</strong> kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem
            geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmEmptyAllOpen(false)}>Vazgeç</Button>
          <Button onClick={handleConfirmEmptyAll} color="error" variant="contained" autoFocus>
            Evet, Tümünü Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmRestoreAllOpen} onClose={() => setIsConfirmRestoreAllOpen(false)}>
        <DialogTitle>Tüm Notları Geri Yükle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Çöp kutusundaki <strong>tüm notları</strong> ana listeye geri yüklemek istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmRestoreAllOpen(false)}>Vazgeç</Button>
          <Button onClick={handleConfirmRestoreAll} color="success" variant="contained" autoFocus>
            Evet, Tümünü Geri Yükle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Geri Bildirim Mesajları */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}