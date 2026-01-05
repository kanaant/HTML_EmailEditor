const getApiBase = () => {
  // If running in browser context
  if (typeof window !== "undefined") {
    const { port } = window.location;
    // Local Dev (Vite default ports)
    if (port === "5173" || port === "5174") {
      return "http://localhost:3001/api";
    }
  }
  // Docker / Production (Nginx proxies /api relative to root)
  return "/api";
};

export const API_BASE = getApiBase();
console.log("Current API_BASE:", API_BASE); // Debugging log

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
};

const getHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Starter Templates API (pre-built templates from backend)
export const getStarterTemplates = async () => {
  const res = await fetch(`${API_BASE}/starter-templates`);
  if (!res.ok) throw new Error("Failed to fetch starter templates");
  return res.json();
};

// User Templates API
export const getTemplates = async () => {
  const res = await fetch(`${API_BASE}/templates`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch templates");
  return res.json();
};

export const getTemplate = async (id) => {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  if (!res.ok) throw new Error("Failed to fetch template");
  return res.json();
};

export const createTemplate = async (name, html) => {
  const res = await fetch(`${API_BASE}/templates`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, html }),
  });
  if (!res.ok) throw new Error("Failed to create template");
  return res.json();
};

export const updateTemplate = async (id, name, html) => {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, html }),
  });
  if (!res.ok) throw new Error("Failed to update template");
  return res.json();
};

export const deleteTemplate = async (id) => {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete template");
  return res.json();
};

// Drafts API
export const getDrafts = async () => {
  const res = await fetch(`${API_BASE}/drafts`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch drafts");
  return res.json();
};

export const getDraft = async (id) => {
  const res = await fetch(`${API_BASE}/drafts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch draft");
  return res.json();
};

export const createDraft = async (name, html) => {
  const res = await fetch(`${API_BASE}/drafts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, html }),
  });
  if (!res.ok) throw new Error("Failed to create draft");
  return res.json();
};

export const updateDraft = async (id, name, html) => {
  const res = await fetch(`${API_BASE}/drafts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, html }),
  });
  if (!res.ok) throw new Error("Failed to update draft");
  return res.json();
};

export const deleteDraft = async (id) => {
  const res = await fetch(`${API_BASE}/drafts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete draft");
  return res.json();
};
