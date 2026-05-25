/**
 * Single source for backend URLs. Set VITE_BASE_URL in frontend/.env
 * (e.g. your cloudflared tunnel URL or http://localhost:5000).
 */
const normalizeBaseUrl = (url) => String(url || '').trim().replace(/\/+$/, '');

export const API_ORIGIN =
  normalizeBaseUrl(import.meta.env.VITE_BASE_URL) || 'http://localhost:5000';

export const API_BASE_URL = `${API_ORIGIN}/api`;

export const AUTH_API = `${API_BASE_URL}/auth`;
export const WORKSPACE_API = `${API_BASE_URL}/workspace`;
export const PROJECT_API = `${API_BASE_URL}/project`;
export const TASK_API = `${API_BASE_URL}/task`;
export const SUBSCRIPTION_API = `${API_BASE_URL}/subscription`;
export const PLAN_API = `${API_BASE_URL}/plan`;
export const CHAT_API = `${API_BASE_URL}/chat`;

/** Socket.io server (same origin as API). */
export const SOCKET_URL = API_ORIGIN;
