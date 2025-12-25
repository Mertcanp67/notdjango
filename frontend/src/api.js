
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");
  const csrftoken = getCookie("csrftoken");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
    ...(csrftoken && { "X-CSRFToken": csrftoken }),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorMsg = `Hata: ${res.status} - ${res.statusText}`;
    try {
      // Backend'den gelen JSON formatındaki hatayı daha okunaklı hale getirmeye çalışalım.
      const errorData = await res.json();
      errorMsg = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
        .join('; ');
    } catch (e) {
      // Hata JSON formatında değilse, olduğu gibi bırakalım.
    }
    throw new Error(errorMsg);
  }
  // 204 No Content gibi boş cevapları veya DELETE metodunu kontrol et
  if (res.status === 204 || options.method === "DELETE") return null;
  return res.json();
};

export const authFetch = async (url, payload) => {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(csrftoken && { "X-CSRFToken": csrftoken }),
    },
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

export const listNotes = (search = "") => {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiFetch(`/api/notes/${q}`);
};

export const createNote = (payload) => apiFetch("/api/notes/", { method: "POST", body: JSON.stringify(payload) });

export const updateNote = (id, payload) => apiFetch(`/api/notes/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });

export const trashNote = (id) => apiFetch(`/api/notes/${id}/`, { method: "DELETE" });

export const updateNoteOrder = (payload) => apiFetch("/api/notes/update-order/", { method: "POST", body: JSON.stringify(payload) });

export const togglePinNote = (id) => apiFetch(`/api/notes/${id}/toggle_pin/`, { method: "POST" });

export const shareNote = (id) => apiFetch(`/api/notes/${id}/share/`, { method: "POST" });

export const getPublicNote = (uuid) => apiFetch(`/api/public-notes/${uuid}/`);


export const listTrashedNotes = ({ page = 1, search = "", ordering = "" }) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (search) params.append("search", search);
  if (ordering) params.append("ordering", ordering);
  const q = params.toString();
  return apiFetch(`/api/trashed-notes/${q ? `?${q}` : ""}`);
};

export const restoreNote = (id) => apiFetch(`/api/trashed-notes/${id}/restore/`, { method: "POST" });

export const deleteNotePermanently = (id) => apiFetch(`/api/trashed-notes/${id}/`, { method: "DELETE" });

export const emptyAllTrash = () =>
  apiFetch("/api/trashed-notes/empty-all/", { method: "DELETE" });

export const restoreAllTrash = () =>
  apiFetch("/api/trashed-notes/restore-all/", { method: "PUT" });


export const loginUser = (payload) => authFetch("/api/auth/login/", payload);

export const registerUser = (payload) => authFetch("/api/auth/registration/", payload);

export const listCategories = () => apiFetch("/api/categories/");

export const createCategory = (payload) =>
  apiFetch("/api/categories/", { method: "POST", body: JSON.stringify(payload) });

export const updateCategory = (id, payload) =>
  apiFetch(`/api/categories/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });

export const deleteCategory = (id) =>
  apiFetch(`/api/categories/${id}/`, { method: "DELETE" });

export const listTags = () => apiFetch("/api/tags/");
