export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5259';

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface UserInfo {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isEmailConfirmed?: boolean;
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setStoredToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeStoredToken = () => {
  localStorage.removeItem('auth_token');
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
