const TOKEN_KEY = "chaupal_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed. Try again.");
  return data;
}

export const api = {
  register: (b) => request("/auth/register", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  me: () => request("/auth/me"),

  people: (q = "") => request(`/users?q=${encodeURIComponent(q)}`),
  profile: (id) => request(`/users/${id}`),
  updateBio: (bio) => request("/users/me", { method: "PUT", body: { bio } }),
  toggleFollow: (id) => request(`/users/${id}/follow`, { method: "POST" }),

  feed: () => request("/posts/feed"),
  explore: () => request("/posts/explore"),
  userPosts: (id) => request(`/posts/user/${id}`),
  createPost: (text) => request("/posts", { method: "POST", body: { text } }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  toggleLike: (id) => request(`/posts/${id}/like`, { method: "POST" }),

  comments: (id) => request(`/posts/${id}/comments`),
  addComment: (id, text) => request(`/posts/${id}/comments`, { method: "POST", body: { text } }),
};
