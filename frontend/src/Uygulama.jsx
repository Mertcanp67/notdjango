import { useEffect, useState, useCallback } from "react";
import React from 'react';
import {
  listNotes,
  createNote,
  updateNote,
  trashNote,
  authFetch,
  listCategories,
  listTags,
} from "./api.js";
import "./stil.css";
import { useDebounce } from "./hooks";
import { Auth } from "./KimlikDogrulama.jsx";
import { Header } from "./Baslik.jsx";
import { Toolbar } from "./AracCubugu.jsx";
import { NoteList } from './NotListesi.jsx';
import { AddNoteModal, EditNoteModal } from './Modallar.jsx';
import { NoteStats } from "./NotIstatistikleri.jsx";
import { CopKutusu } from "./CopKutusu.jsx";


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export default function Uygulama() {
  const [view, setView] = useState('main');
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", is_private: false, tags: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isClosingAddModal, setIsClosingAddModal] = useState(false);
  const [isClosingEditModal, setIsClosingEditModal] = useState(false);
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
        owner: n.owner ?? "Anonim",
      }));
      setNotes(normalizedNotes);
      setCategories(categoriesData);
      setTags(tagsData);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("currentUser", currentUser);
      load(debouncedSearchTerm);
    } else {
      setNotes([]);
      setCategories([]);
      localStorage.removeItem("currentUser");
    }
  }, [token, currentUser, debouncedSearchTerm, load]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
      showSuccess("Başarıyla kayıt olundu! Lütfen giriş yapın.");
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

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    setCurrentUser("");
    setToken(null);
    setIsAdmin(false);
  };

const onAdd = useCallback(async (noteData) => {
    if (!noteData.title.trim()) return;
    try {
      setLoading(true);
      setError("");
      await sleep(1000);
      const payload = {
        ...noteData,
        tags: noteData.tags, // Artık etiketler zaten string dizisi
      };
      const created = await createNote(payload);
      const normalized = { ...created, owner: created.owner ?? currentUser };
      setNotes((prev) => [normalized, ...prev]);
      
      handleCloseAddModal(true);
      reloadTags(); // Etiketleri yeniden yükle
      showSuccess("Not başarıyla eklendi!");

    } catch (e) {
      console.error("Not eklenirken hata:", e); // Hata ayıklama için eklendi
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, reloadTags]);

  const handleCloseAddModal = useCallback((resetForm = false) => {
    setIsClosingAddModal(true);
    setTimeout(() => {
      setIsAddModalOpen(false);
      setIsClosingAddModal(false);
      if (resetForm) {
        setForm({ title: "", content: "", is_private: false, tags: [] }); 
      }
    }, 300);
  }, []);

  const onTrash = useCallback(async (id) => {
    const prev = notes;
    setNotes(prev.filter((n) => n.id !== id));
    try {
      setError("");
      await trashNote(id);
      reloadTags(); // Etiketleri yeniden yükle
      showSuccess("Not başarıyla çöpe taşındı!");
    } catch (e) {
      setError("Çöpe taşıma başarısız: " + e.message);
      setNotes(prev);
    }
  }, [notes, reloadTags]);

  const onSave = useCallback(async (note) => {
    try {
      setError("");
      const updated = await updateNote(note.id, {
        title: note.title,
        content: note.content,
        is_private: note.is_private,
        tags: note.tags, // Artık etiketler zaten string dizisi
      });

      const fixed = { ...updated, owner: updated.owner ?? note.owner };
      setNotes((prev) => prev.map((n) => (n.id === note.id ? fixed : n)));

      reloadTags(); // Etiketleri yeniden yükle
      showSuccess("Not başarıyla güncellendi!");

    } catch (e) {
      setError("Güncelleme başarısız: Yetkiniz olmayabilir. " + e.message);
    }
  }, [reloadTags]);

  const handleStartEdit = useCallback((note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsClosingEditModal(true);
    setTimeout(() => {
      setIsEditModalOpen(false);
      setEditingNote(null);
      setIsClosingEditModal(false);
    }, 300);
  }, []);

  const handleSaveAndClose = async () => {
    await onSave(editingNote);
    handleCloseEditModal();
  };

  const handleDragStart = (e, noteId) => {
    setDraggedNoteId(noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, noteId) => {
    e.preventDefault();
    if (noteId !== dragOverNoteId) {
      setDragOverNoteId(noteId);
    }
  };

  const handleDrop = async (e, dropNoteId) => {
    e.preventDefault();
    if (draggedNoteId === dropNoteId) return;

    const draggedIndex = notes.findIndex(n => n.id === draggedNoteId);
    const dropIndex = notes.findIndex(n => n.id === dropNoteId);

    if (draggedIndex === -1 || dropIndex === -1) return;

    const newNotes = [...notes];
    const [draggedItem] = newNotes.splice(draggedIndex, 1);
    newNotes.splice(dropIndex, 0, draggedItem);

    setNotes(newNotes);

  };

  const filteredNotes = notes.filter(note => {
    const tagMatch = selectedTag 
      ? Array.isArray(note.tags) && note.tags.includes(selectedTag) 
      : true;
    return tagMatch;
  });

  if (!token) {
    return <Auth 
      onLogin={handleLogin} 
      onRegister={handleRegister} 
      loading={loading} 
      error={error} 
      setError={setError}
      successMessage={successMessage}
      isSuccessVisible={isSuccessVisible}
    />;
  }

  return (
    <>
      <div className="container">
        <Header currentUser={currentUser} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} isAdmin={isAdmin} />

        {successMessage && (
          <div className={`alert-success ${isSuccessVisible ? 'visible' : ''}`}>
              ✅ {successMessage}
          </div>
        )}

        <div className="main-layout">
          <div className="main-layout-left">
            <NoteStats 
              notes={notes}
              tags={tags}
              categories={categories}
              onTagClick={(tag) => setSelectedTag(tag)}
              selectedTag={selectedTag}
            />
          </div>

          <div className="main-layout-right">
            <Toolbar 
              search={search} 
              setSearch={setSearch} 
              onAddNoteClick={() => setIsAddModalOpen(true)}
              onSwitchToTrashView={() => setView('trash')}
            />

            {loading && <p className="footer-muted">Yükleniyor…</p>}
            {error && (
              <p className="footer-muted" style={{ color: "#ffb3b3" }}>
                Hata: {error}
              </p>
            )}

            {view === 'main' ? (
              <NoteList
                notes={notes}
                setNotes={setNotes}
                filteredNotes={filteredNotes}
                activeFilter={selectedTag}
                onSave={onSave}
                onStartEdit={handleStartEdit}
                onTrash={onTrash}
                onTagClick={(tag) => setSelectedTag(tag)}
                currentUser={currentUser}
                draggedNoteId={draggedNoteId}
                dragOverNoteId={dragOverNoteId}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isAdmin={isAdmin} 
              />
            ) : (
              <CopKutusu 
                onSwitchToMainView={() => {
                  setView('main');
                  load(); // Notları yeniden yükle
                }}
                onNoteRestored={() => showSuccess("Not başarıyla geri getirildi!")}
              />
            )}
          </div>

        </div>

        <AddNoteModal
          isOpen={isAddModalOpen}
          onClose={() => handleCloseAddModal(false)}
          form={form}
          setForm={setForm}
          onAdd={onAdd}
          loading={loading}
          isClosing={isClosingAddModal}
        />
        <EditNoteModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          note={editingNote} setNote={setEditingNote}
          onSave={handleSaveAndClose}
          loading={loading}
          isClosing={isClosingEditModal}
        />
      </div>
    </>
  );
}
