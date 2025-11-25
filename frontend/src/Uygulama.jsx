import { useEffect, useState, useCallback } from "react";
import React from 'react';
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  authFetch,
  listCategories,
} from "./api.js";
import "./stil.css";
import { useDebounce } from "./hooks";
import { Auth } from "./KimlikDogrulama.jsx";
import { Header } from "./Baslik.jsx";
import { Toolbar } from "./AracCubugu.jsx";
import { NoteList } from './NotListesi.jsx';
import { AddNoteModal, EditNoteModal } from './Modallar.jsx';
import { NoteStats } from "./NotIstatistikleri.jsx";


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export default function Uygulama() {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

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

  const debouncedSearchTerm = useDebounce(search, 500);

  const load = useCallback(async (term = "") => {
    try {
      setLoading(true);
      const [notesData, categoriesData] = await Promise.all([
        listNotes(term),
        listCategories(),
      ]);
      
      const normalizedNotes = notesData.map((n) => ({
        ...n,
        owner: n.owner ?? "Anonim",
      }));
      setNotes(normalizedNotes);
      setCategories(categoriesData);

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
      showSuccess("Kayıt başarılı! Lütfen giriş yapın.");
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

const onAdd = useCallback(async () => {
    if (!form.title.trim()) return;
    try {
      setLoading(true);
      setError("");
      await sleep(1000);
      const payload = {
        ...form,
        tags: form.tags.map(tag => tag.text),
      };
      const created = await createNote(payload);
      const normalized = { ...created, owner: created.owner ?? currentUser };
      setNotes((prev) => [normalized, ...prev]);
      
      handleCloseAddModal(true);
      showSuccess("Not başarıyla eklendi!");

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form, currentUser]);

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

  const onDelete = useCallback(async (id) => {
    const prev = notes;
    setNotes(prev.filter((n) => n.id !== id));
    try {
      setError("");
      await deleteNote(id);
      showSuccess("Not başarıyla silindi!");
    } catch (e) {
      setError("Silme başarısız: Yetkiniz olmayabilir. " + e.message);
      setNotes(prev);
    }
  }, [notes]);

  const onSave = useCallback(async (note) => {
    try {
      setError("");
      const updated = await updateNote(note.id, {
        title: note.title,
        content: note.content,
        is_private: note.is_private,
        tags: note.tags.map(tag => typeof tag === 'object' ? tag.text : tag),
      });

      const fixed = { ...updated, owner: updated.owner ?? note.owner };
      setNotes((prev) => prev.map((n) => (n.id === note.id ? fixed : n)));

      showSuccess("Not başarıyla güncellendi!");

    } catch (e) {
      setError("Güncelleme başarısız: Yetkiniz olmayabilir. " + e.message);
    }
  }, []);

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

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    // Kategori filtresini temizle
    setActiveCategoryFilter(null);
  };

  const handleCategoryFilterClick = (categoryId) => {
    setActiveCategoryFilter(prev => prev === categoryId ? null : categoryId);
    // Etiket filtresini temizle
    setSelectedTag(null);
  };

  const filteredNotes = notes.filter(note => {
    const tagMatch = selectedTag ? note.tags.includes(selectedTag) : true;
    const categoryMatch = activeCategoryFilter ? note.category?.id === activeCategoryFilter : true;
    return tagMatch && categoryMatch;
  });

  if (!token) {
    return <Auth onLogin={handleLogin} onRegister={handleRegister} loading={loading} error={error} setError={setError} />;
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
              categories={categories}
              activeFilter={activeCategoryFilter}
              handleFilterClick={handleCategoryFilterClick}
              onTagClick={handleTagClick}
              selectedTag={selectedTag}
            />
          </div>

          <div className="main-layout-right">
            <Toolbar search={search} setSearch={setSearch} onAddNoteClick={() => setIsAddModalOpen(true)} />

            {loading && <p className="footer-muted">Yükleniyor…</p>}
            {error && (
              <p className="footer-muted" style={{ color: "#ffb3b3" }}>
                Hata: {error}
              </p>
            )}

            <NoteList
              notes={notes}
              setNotes={setNotes}
              filteredNotes={filteredNotes}
              activeFilter={selectedTag || activeCategoryFilter}
              onSave={onSave}
              onStartEdit={handleStartEdit}
              onDelete={onDelete}
              currentUser={currentUser}
              isAdmin={isAdmin} 
            />
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
