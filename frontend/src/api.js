// api.js
// Adresin sonunda slash (/) olmamasına dikkat edin
const BASE_URL = "https://notdjango.onrender.com";
export const apiFetch = async (url, options = {}) => { // url artık /api/notes/ gibi olacak
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.reload();
    throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Hatası: ${res.status} ${errorText || res.statusText}`);
  }
  if (options.method === "DELETE") return true;
  return res.json();
};

export const authFetch = async (url, payload) => {
  const res = await fetch(`${API_BASE_URL}${url}`, { // url artık /api/auth/login/ gibi olacak
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    console.error("Auth Hata Detayları:", errorData); // Sunucudan gelen hatayı konsola yazdır

    let errorMsg = "Giriş/Kayıt işlemi başarısız oldu.";
    try {
      errorMsg =
        errorData?.non_field_errors?.[0] ||
        Object.values(errorData || {}).flat().join(" ") ||
        errorMsg;
    } catch (e) { console.error("Hata mesajı ayrıştırılamadı:", e) }
    throw new Error(errorMsg);
  }
  return res.json();
};

export const listNotes = (search = "") => {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/api/notes/${q}`);
};
export const createNote = (payload) =>
  apiFetch("/api/notes/", { method: "POST", body: JSON.stringify(payload) });
export const updateNote = (id, payload) =>
  apiFetch(`/api/notes/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteNote = (id) =>
  apiFetch(`/api/notes/${id}/`, { method: "DELETE" });

// Auth Fonksiyonları
export const loginUser = (payload) =>
  authFetch("/api/auth/login/", payload);

export const registerUser = (payload) =>
  authFetch("/api/auth/registration/", payload);
