
// DİKKAT: Değişken tanımlamayı bıraktık. Adresi direkt aşağıya yazdık.

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
    ...options.headers,
  };

  // URL'yi direkt buraya yazdık. Hata verme şansı yok.
  const res = await fetch(`https://notdjango.onrender.com${url}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.reload();
    throw new Error("Oturum süresi doldu.");
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Hata: ${res.status} ${errorText}`);
  }
  if (options.method === "DELETE") return true;
  return res.json();
};

export const authFetch = async (url, payload) => {
  // Buraya da direkt yazdık.
  const res = await fetch(`https://notdjango.onrender.com${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    let errorMsg = "İşlem başarısız.";
    try {
      errorMsg = errorData?.non_field_errors?.[0] || Object.values(errorData || {}).flat().join(" ") || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
};

// Diğer fonksiyonlar aynı kalabilir çünkü onlar yukarıdakileri kullanıyor
export const listNotes = (search = "") => {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/api/notes/${q}`);
};
export const createNote = (payload) => apiFetch("/api/notes/", { method: "POST", body: JSON.stringify(payload) });
export const updateNote = (id, payload) => apiFetch(`/api/notes/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const trashNote = (id) => apiFetch(`/api/notes/${id}/`, { method: "DELETE" });

// Çöp Kutusu için yeni fonksiyonlar
export const listTrashedNotes = () => apiFetch("/api/trashed-notes/");
export const restoreNote = (id) => apiFetch(`/api/trashed-notes/${id}/restore/`, { method: "POST" });
export const deleteNotePermanently = (id) => apiFetch(`/api/trashed-notes/${id}/`, { method: "DELETE" });


export const loginUser = (payload) => authFetch("/api/auth/login/", payload);
export const registerUser = (payload) => authFetch("/api/auth/registration/", payload);
export const listCategories = () => apiFetch("/api/categories/");
export const createCategory = (payload) =>
  apiFetch("/api/categories/", { method: "POST", body: JSON.stringify(payload) });
export const updateCategory = (id, payload) =>
  apiFetch(`/api/categories/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const listTags = () => apiFetch("/api/tags/");