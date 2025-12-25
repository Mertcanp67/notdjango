import { useEffect, useState, useCallback, useMemo } from "react";
import { useDebounce } from './hooks.js';
import React from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PublicNoteViewer from './PublicNoteViewer';
import { Auth } from './KimlikDogrulama.jsx';
import { CopKutusu } from "./CopKutusu";
import { Toolbar } from './AracCubugu.jsx';
import { Header } from './Baslik.jsx';
import NotListesi from './NotListesi.jsx';
import { KategoriYonetimiModal } from './KategoriYonetimiModal.jsx';
import { AddNoteModal, EditNoteModal, ShareModal } from './Modallar.jsx';
import { 
    listNotes,
    listCategories,
    listTags,
    createNote,
    trashNote,
    updateNote,
    shareNote,
    togglePinNote,
    createCategory,
    updateCategory,
    deleteCategory,
    authFetch
} from './api.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getMuiTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#0d6efd', dark: '#0a58ca' },
          divider: '#dee2e6',
          background: { default: '#f8f9fa', paper: '#ffffff' },
          text: { primary: '#212529', secondary: '#6c757d' },
          error: { main: '#dc3545' },
          success: { main: '#198754' },
        }
      : {
          primary: { main: '#58a6ff', dark: '#79c0ff' },
          divider: '#30363d',
          background: { default: '#0d1117', paper: '#161b22' },
          text: { primary: '#c9d1d9', secondary: '#8b949e' },
          error: { main: '#f85149' },
          success: { main: '#3fb950' },
        }),
  },
  shape: {
    borderRadius: 12,
  },
});

const GlobalCssVars = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const shadowSm = isDark ? '0 0 0 1px #30363d' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  const shadowLg = isDark ? '0 8px 24px #010409' : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  const shadowXl = isDark ? '0 16px 48px #010409' : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
  const dangerSoftBg = isDark ? 'rgba(248, 81, 73, 0.15)' : 'rgba(220, 53, 69, 0.1)';
  const bodyBackgroundImage = isDark
    ? 'radial-gradient(circle at 1% 1%, rgba(88, 166, 255, 0.1) 0%, transparent 30%), radial-gradient(circle at 99% 99%, rgba(88, 166, 255, 0.1) 0%, transparent 40%)'
    : 'radial-gradient(circle at 1% 1%, rgba(9, 105, 218, 0.05) 0%, transparent 30%), radial-gradient(circle at 99% 99%, rgba(9, 105, 218, 0.05) 0%, transparent 40%)';

  const style = `
    :root {
      --background: ${theme.palette.background.default};
      --card: ${theme.palette.background.paper};
      --text: ${theme.palette.text.primary};
      --muted: ${theme.palette.text.secondary};
      --border: ${theme.palette.divider};
      --primary: ${theme.palette.primary.main};
      --primary-strong: ${theme.palette.primary.dark};
      --danger: ${theme.palette.error.main};
      --danger-soft-bg: ${dangerSoftBg};
      --success: ${theme.palette.success.main};
      --radius: ${theme.shape.borderRadius}px;
      --shadow-sm: ${shadowSm};
      --shadow-lg: ${shadowLg};
      --shadow-xl: ${shadowXl};
    }
    body {
      background-image: ${bodyBackgroundImage};
    }
  `;
  return <style>{style}</style>;
};

export default function Uygulama() {
  const [view, setView] = useState('main');
  const [publicNoteUuid, setPublicNoteUuid] = useState(null);
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingNoteUrl, setSharingNoteUrl] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const [dragOverNoteId, setDragOverNoteId] = useState(null);


  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser") || ""
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("isAdmin") === 'true'
  );

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const reloadTags = useCallback(async () => {
    try {
      const tagsData = await listTags();
      setTags(tagsData);
    } catch (e) {
      console.error("Etiketler yeniden yüklenirken hata oluştu:", e);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    setCurrentUser("");
    setToken(null);
    setIsAdmin(false);
  }, []);

  const debouncedSearchTerm = useDebounce(search, 500);

  const load = useCallback(async (term = "") => {
    try {
      setLoading(true);
      const [notesData, categoriesData, tagsData] = await Promise.all([
        listNotes(term),
        listCategories(),
        listTags(),
      ]);
      
      const normalizedNotes = notesData.map((n) => ({
        ...n,
        // API'den gelen owner alanı bir obje ({username: '...'}) veya string olabilir.
        // Her iki durumu da ele alarak sadece kullanıcı adını alıyoruz.
        owner: (typeof n.owner === 'object' && n.owner !== null ? n.owner.username : n.owner) ?? "Anonim",
        // API'den `updated_at` gelmezse veya null ise, `created_at` alanını kullan.
        updated_at: n.updated_at || n.created_at,
      }));
      
      normalizedNotes.sort((a, b) => b.is_pinned - a.is_pinned || a.order - b.order);
      setNotes(normalizedNotes);
      setCategories(categoriesData);
      setTags(tagsData);

    } catch (e) {
      // Eğer API'den gelen hata kimlik doğrulama ile ilgiliyse (örn: 401),
      // token geçersiz demektir. Kullanıcıyı otomatik olarak çıkışa yönlendir.
      if (e.message.includes("401") || e.message.includes("Authentication credentials")) {
        handleLogout();
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/share\/(.*)/);
    if (match) {
      const uuid = match[1];
      setPublicNoteUuid(uuid);
      setView('public');
    } else if (token) {
      localStorage.setItem("currentUser", currentUser);
      load(debouncedSearchTerm);
    } else {
      setNotes([]);
      setCategories([]);
      localStorage.removeItem("currentUser");
    }
  }, [token, currentUser, debouncedSearchTerm, load]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setIsSuccessVisible(true);
    setTimeout(() => {
      setIsSuccessVisible(false);
    }, 2500);
  };


  const handleRegister = async (username, password, password2, email) => {
    if (!username || !password || !password2 || !email) {
      setError("Tüm alanlar zorunludur!");
      return;
    }
    if (password !== password2) {
      setError("Şifreler uyuşmuyor!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authFetch("/api/auth/registration/", {
        username,
        password1: password,
        password2,
        email,
      });

      setLoading(false);
      showSuccess("Başarıyla kayıt olundu!");
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  const handleLogin = async (username, password) => {
    if (!username || !password) {
      setError("Kullanıcı adı veya e-posta ve şifre gerekli!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await authFetch("/api/auth/login/", {
        username,
        password,
      });

      localStorage.setItem("authToken", data.key);
      localStorage.setItem("currentUser", username);
      localStorage.setItem("isAdmin", data.is_staff);

      setCurrentUser(username);
      setToken(data.key); 
      setIsAdmin(data.is_staff);
      showSuccess(`Hoş geldin, ${username}! Başarıyla giriş yapıldı.`);
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  const handleAuthSubmit = (mode, form) => {
    if (mode === 'login') {
      handleLogin(form.username, form.password);
    } else if (mode === 'register') {
      handleRegister(form.username, form.password, form.password2, form.email);
    }
  };

const onAdd = useCallback(async (noteData) => {
    if (!noteData.title.trim()) return;
    try {
      setLoading(true);
      setError("");
      const created = await createNote(noteData);
      const normalized = {
        ...created,
        owner: created.owner ?? currentUser,
        // API'den `updated_at` gelmezse, `created_at` veya anlık zamanı kullan
        updated_at: created.updated_at || created.created_at || new Date().toISOString(),
      };
      setNotes((prev) => [normalized, ...prev]);
      
      setIsAddModalOpen(false); // Modalı doğrudan kapat
      reloadTags(); // Etiketleri yeniden yükle
      showSuccess("Not başarıyla eklendi!");

    } catch (e) {
      console.error("Not eklenirken hata:", e); // Hata ayıklama için eklendi
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, reloadTags]);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const onTrash = useCallback(async (id) => {
    // İşlem sırasında geri bildirim vermek ve hata durumunda geri almak için
    // orijinal notları saklıyoruz.
    const originalNotes = notes;
    // Arayüzü hemen güncelleyerek kullanıcıya anında geri bildirim veriyoruz (Optimistic Update).
    setNotes(prev => prev.filter(n => n.id !== id));

    try {
      // API isteğini arka planda gönderiyoruz.
      await trashNote(id);

      // İşlem başarılı olursa, arayüz zaten güncellenmişti.
      // Çöp kutusunun ve etiketlerin durumunu güncelliyoruz.
      reloadTags(); // Etiket listesini güncelle
      showSuccess("Not başarıyla çöpe taşındı!");
    } catch (e) {
      setError("Çöpe taşıma başarısız: " + e.message);
      // Hata durumunda, arayüzü eski haline geri döndürüyoruz.
      setNotes(originalNotes);
    }
  }, [notes, reloadTags]);

  const handleNoteRestored = useCallback(() => {
    showSuccess("Not başarıyla geri getirildi!");
    // Ana not listesini arka planda yeniden yükle
    load();
    // CopKutusu bileşeni kendi kendini zaten yenilediği için
    // bu satır gereksiz bir yeniden render'a neden oluyordu.
    // setNotesVersion(v => v + 1);
  }, [load]);

  const onSave = useCallback(async (note) => {
    // Düzenleme modalından gelen 'note' verisi, kategori ID'sini içerir.
    const payload = {
        title: note.title,
        content: note.content,
        is_private: note.is_private,
        tags: note.tags, // Artık etiketler zaten string dizisi
        category: note.category, // API'ye kategori ID'sini gönder
    };

    try {
      setError("");
      // API'den güncellenmiş not dönebilir (200 OK) veya boş dönebilir (204 No Content).
      const updatedFromServer = await updateNote(note.id, payload);

      // Sunucudan tam not nesnesi döndüyse onu kullan, dönmediyse (204 No Content)
      // yerel veriyi ve kategori nesnesini birleştirerek UI'ı güncelle.
      let finalNote;
      if (updatedFromServer && Object.keys(updatedFromServer).length > 0) {
          finalNote = {
              ...updatedFromServer,
              owner: (typeof updatedFromServer.owner === 'object' && updatedFromServer.owner !== null ? updatedFromServer.owner.username : updatedFromServer.owner) ?? currentUser,
              updated_at: updatedFromServer.updated_at || new Date().toISOString(),
          };
      } else {
          // Sunucudan veri gelmediyse, elimizdeki verilerle notu yeniden oluştur.
          const categoryObject = categories.find(c => c.id === payload.category);
          finalNote = { 
              ...note, // Modal'dan gelen temel not verileri (id, vs.)
              ...payload, // Güncellenen alanlar
              category: categoryObject, // ID yerine tam nesneyi koy
              updated_at: new Date().toISOString(), // Güncelleme zamanını ayarla
          };
      }
      setNotes((prev) => prev.map((n) => (n.id === note.id ? finalNote : n)));

      reloadTags(); // Etiketleri yeniden yükle
      showSuccess("Not başarıyla güncellendi!");

    } catch (e) {
      setError("Güncelleme başarısız: Yetkiniz olmayabilir. " + e.message);
    }
  }, [reloadTags, categories, currentUser]);

  const handleShareNote = async (note) => {
    try {
      const updatedNote = await shareNote(note.id);
      // Update the note in the main notes list
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      // Update the note in the edit modal if it's open
      if (editingNote && editingNote.id === updatedNote.id) {
        setEditingNote(updatedNote);
      }
      
      if (updatedNote.is_shared) {
        setSharingNoteUrl(`${window.location.origin}/share/${updatedNote.share_uuid}`);
        setIsShareModalOpen(true);
      } else {
        showSuccess("Paylaşım kapatıldı.");
      }
    } catch (err) {
      setError("Paylaşım durumu güncellenemedi: " + err.message);
    }
  };

  const handleTogglePin = useCallback(async (id) => {
    const originalNotes = [...notes];
    const noteToPin = notes.find(n => n.id === id);
    if (!noteToPin) return;

    // İyimser Güncelleme
    const updatedNote = { ...noteToPin, is_pinned: !noteToPin.is_pinned };
    const newNotes = notes.map(n => n.id === id ? updatedNote : n);
    // Sıralamayı hemen arayüzde yansıt
    newNotes.sort((a, b) => b.is_pinned - a.is_pinned || a.order - b.order);
    setNotes(newNotes);

    try {
      await togglePinNote(id);
    } catch (err) {
      setError("Pinleme durumu güncellenemedi: " + err.message);
      setNotes(originalNotes); // Hata durumunda geri al
    }
  }, [notes]);

  const handleCreateCategory = async (categoryData) => {
    try {
      const newCategory = await createCategory(categoryData);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      showSuccess("Kategori başarıyla oluşturuldu!");
    } catch (err) {
      setError("Kategori oluşturulamadı: " + err.message);
      throw err; // Hatanın modal içinde de yakalanabilmesi için tekrar fırlat
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat).sort((a, b) => a.name.localeCompare(b.name)));
      // Notların da güncel kategori bilgisine sahip olması için yeniden yükle
      load(debouncedSearchTerm);
      showSuccess("Kategori başarıyla güncellendi!");
    } catch (err) {
      setError("Kategori güncellenemedi: " + err.message);
      throw err;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // Bu kategoriye sahip notlar artık kategorisiz olacak.
      // Arayüzü güncellemek için notları yeniden yükle.
      load(debouncedSearchTerm);
      showSuccess("Kategori başarıyla silindi!");
    } catch (err) {
      // Backend'den gelen hatayı kontrol et, kategori kullanımdaysa farklı bir mesaj gösterilebilir.
      if (err.message.includes("still in use")) {
        setError("Kategori silinemedi. Önce bu kategoriye ait notları başka bir kategoriye taşıyın.");
      } else {
        setError("Kategori silinemedi: " + err.message);
      }
      throw err;
    }
  };

  const handleStartEdit = useCallback((note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleSaveAndClose = async (noteToSave) => {
    // Modal'dan gelen güncel not verisini doğrudan onSave fonksiyonuna iletiyoruz.
    // Önceki hali, asenkron state güncellemeleri nedeniyle eski (stale) veriyi kullanıyordu.
    await onSave(noteToSave);
    handleCloseEditModal();
  };

  const handleDragStart = (e, noteId) => {
    const note = notes.find(n => n.id === noteId);
    // Sabitlenmiş notların sürüklenmesini engelle
    if (note?.is_pinned) {
      e.preventDefault();
      return;
    }
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, noteId) => {
    const overNote = notes.find(n => n.id === noteId);
    // Sabitlenmiş bir notun üzerine sürükleniyorsa, bırakmaya izin verme.
    // e.preventDefault() çağrılmazsa, tarayıcı varsayılan olarak bırakmayı engeller.
    if (overNote?.is_pinned) {
      return;
    }
    e.preventDefault();
    if (noteId !== dragOverNoteId) {
      setDragOverNoteId(noteId);
    }
  };

  const handleDrop = async (e, dropNoteId) => {
    e.preventDefault();

    const dropNote = notes.find(n => n.id === dropNoteId);
    if (dropNote?.is_pinned) {
        setDraggedNoteId(null);
        setDragOverNoteId(null);
        return;
    }

    // Sürüklenen veya bırakılan not yoksa veya aynı not ise işlemi durdur
    if (!draggedNoteId || !dropNoteId || draggedNoteId === dropNoteId) {
      setDraggedNoteId(null);
      setDragOverNoteId(null);
      return;
    }

    const originalNotes = [...notes]; // Hata durumunda geri dönmek için orijinal sırayı sakla
    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId);
    const dropIndex = notes.findIndex(n => n.id === dropNoteId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    // İyimser Arayüz Güncellemesi (Optimistic UI Update)
    // Arayüzü hemen güncelleyerek kullanıcıya anında geri bildirim veriyoruz.
    const newNotes = [...notes];
    const [draggedItem] = newNotes.splice(draggedIndex, 1);
    newNotes.splice(dropIndex, 0, draggedItem);
    setNotes(newNotes);

    // Sürükleme durumlarını temizle
    setDraggedNoteId(null);
    setDragOverNoteId(null);

    // Backend'e yeni sırayı kaydet
    try {
      const orderedIds = newNotes.map(n => n.id);
      // `updateNoteOrder` fonksiyonu sunucunun beklemediği bir POST isteği gönderiyordu.
      // Sunucu bu işlem için PUT metodunu beklediğinden, isteği `authFetch` kullanarak
      // doğrudan ve doğru metodla yapacak şekilde güncelliyoruz.
      await authFetch('/api/notes/update_order/', { method: 'PUT', body: { ordered_ids: orderedIds } });
    } catch (err) {
      setError("Not sırası güncellenemedi: " + err.message);
      setNotes(originalNotes); // Hata olursa arayüzü eski haline getir
    }
  };

  const filteredNotes = notes.filter(note => {
    const tagMatch = selectedTag 
      ? Array.isArray(note.tags) && note.tags.includes(selectedTag) 
      : true;
    return tagMatch;
  });

  const muiTheme = useMemo(() => getMuiTheme(theme), [theme]);

  if (view === 'public') {
    return (
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <GlobalCssVars />
        <PublicNoteViewer uuid={publicNoteUuid} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <GlobalCssVars />
      {!token ? (
        <Auth 
          onSubmit={handleAuthSubmit}
          loading={loading} 
          error={error} 
          setError={setError}
          successMessage={successMessage}
          isSuccessVisible={isSuccessVisible}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <div className="app-layout">
          <Toolbar
            notes={notes}
            tags={tags}
            categories={categories}
            onTagClick={(tag) => setSelectedTag(tag)}
            selectedTag={selectedTag}
            onSwitchToTrashView={() => setView('trash')}
            currentUser={currentUser}
            onLogout={handleLogout}
            onManageCategories={() => setIsCategoryModalOpen(true)}
            isAdmin={isAdmin}
          />

          <main className="main-content">
            <Header 
              currentUser={currentUser} 
              theme={theme} 
              onToggleTheme={toggleTheme} 
              search={search} 
              setSearch={setSearch} 
              onAddNoteClick={() => setIsAddModalOpen(true)}
            />

          {successMessage && (
            <div className={`alert-success ${isSuccessVisible ? 'visible' : ''}`}>
                ✅ {successMessage}
            </div>
          )}
            {loading && <p className="footer-muted">Yükleniyor…</p>}
            {error && (
              <p className="footer-muted" style={{ color: "#ffb3b3" }}>
                Hata: {error}
              </p>
            )}

            {view === 'main' ? (
              <NotListesi
                notes={filteredNotes}
                onNoteSelect={handleStartEdit}
                onNoteDelete={onTrash}
                onTagClick={(tag) => setSelectedTag(tag)}
                onTogglePin={handleTogglePin}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ) : (
              <CopKutusu
                onSwitchToMainView={() => {
                  setView('main');
                  load(); // Notları yeniden yükle
                }}
                onNoteRestored={handleNoteRestored}
              />
            )}
          </main>

          <AddNoteModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            onAdd={onAdd}
            categories={categories}
            loading={loading}
          />
          <EditNoteModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            note={editingNote}
            categories={categories}
            onSave={handleSaveAndClose}
            onShare={handleShareNote}
            loading={loading}
          />
          <KategoriYonetimiModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            categories={categories}
            onCreate={handleCreateCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
          <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            shareUrl={sharingNoteUrl}
          />
        </div>
      )}
    </ThemeProvider>
  );
}
