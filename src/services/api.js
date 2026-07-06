let store;
export const injectStore = (_store) => {
  store = _store;
};

const url = import.meta.env.VITE_API_URL;
const BASE_URL = url[url.length - 1] === "/" ? url.slice(0, -1) + '/api' : url + "/api";

export const loginAPI = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const registerAPI = async (name, email, password, role) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const createProjectAPI = async (name, description, token) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, description })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create project');
  return data;
};

export const fetchProjectsAPI = async (token) => {
  const res = await fetch(`${BASE_URL}/projects`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch projects');
  return data;
};

export const fetchUserAPI = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
  return data;
};

// Generic fetch wrapper with auto-injected Auth token
export const fetchAPI = async (endpoint, options = {}) => {
  const token = store ? store.getState()?.auth?.token : null;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API request failed');
  return data;
};

// Build a query string from an object, filtering out undefined/null values
const buildQuery = (params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

// ─── Tasks ───────────────────────────────────────────────────────────────────

// GET /tasks/project/:projectId — no sticky_notes, supports pagination
export const fetchProjectTasksAPI = async (projectId, { page = 1, limit = 30 } = {}) => {
  return await fetchAPI(`/tasks/project/${projectId}${buildQuery({ page, limit })}`);
};

// GET /tasks/queue/:userId — no sticky_notes, supports pagination
export const fetchUserQueueAPI = async (userId, { page = 1, limit = 20 } = {}) => {
  return await fetchAPI(`/tasks/queue/${userId}${buildQuery({ page, limit })}`);
};

// GET /tasks/:taskId/notes — nested resource, loaded on demand
export const fetchTaskNotesAPI = async (taskId, { page = 1, limit = 20 } = {}) => {
  return await fetchAPI(`/tasks/${taskId}/notes${buildQuery({ page, limit })}`);
};

export const generateInviteCodeAPI = async (projectId, expiresInHours) => {
  return await fetchAPI(`/projects/${projectId}/generate-invite`, {
    method: 'POST',
    body: JSON.stringify({ expiresInHours: parseFloat(expiresInHours) })
  });
};

export const createStickyNoteAPI = async (taskId, text) => {
  return await fetchAPI(`/tasks/${taskId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
};

export const updateStickyNoteAPI = async (noteId, text) => {
  return await fetchAPI(`/tasks/notes/${noteId}`, {
    method: 'PUT',
    body: JSON.stringify({ text })
  });
};

export const deleteStickyNoteAPI = async (noteId) => {
  return await fetchAPI(`/tasks/notes/${noteId}`, {
    method: 'DELETE'
  });
};

export const joinProjectAPI = async (code, role) => {
  return await fetchAPI(`/projects/join`, {
    method: 'POST',
    body: JSON.stringify({ code, role })
  });
};

export const fetchProjectMembersAPI = async (projectId) => {
  return await fetchAPI(`/projects/${projectId}/members`);
};

// GET /projects/:id/activities — supports pagination
export const fetchProjectActivitiesAPI = async (projectId, { page = 1, limit = 20 } = {}) => {
  return await fetchAPI(`/projects/${projectId}/activities${buildQuery({ page, limit })}`);
};

export const removeProjectMemberAPI = async (projectId, userId) => {
  return await fetchAPI(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE'
  });
};

export const fetchProjectAnalyticsAPI = async (projectId) => {
  return await fetchAPI(`/projects/${projectId}/analytics`);
};

export const deleteTaskAPI = async (taskId) => {
  return await fetchAPI(`/tasks/${taskId}`, {
    method: 'DELETE'
  });
};

export const verifyPasswordAPI = async (password) => {
  return await fetchAPI('/auth/verify-password', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
};

export const updateProfileAPI = async ({ name, email }) => {
  return await fetchAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, email })
  });
};

export const changePasswordAPI = async ({ oldPassword, newPassword }) => {
  return await fetchAPI('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ oldPassword, newPassword })
  });
};
