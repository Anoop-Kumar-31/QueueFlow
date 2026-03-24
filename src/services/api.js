const BASE_URL = 'http://localhost:5000/api';

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
  const token = localStorage.getItem('token');
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

export const joinProjectAPI = async (code) => {
  return await fetchAPI(`/projects/join`, {
    method: 'POST',
    body: JSON.stringify({ code })
  });
};

export const fetchProjectMembersAPI = async (projectId) => {
  return await fetchAPI(`/projects/${projectId}/members`);
};

export const fetchProjectActivitiesAPI = async (projectId) => {
  return await fetchAPI(`/projects/${projectId}/activities`);
};

export const removeProjectMemberAPI = async (projectId, userId) => {
  return await fetchAPI(`/projects/${projectId}/members/${userId}`, {
    method: 'DELETE'
  });
};