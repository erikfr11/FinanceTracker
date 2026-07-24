import { fetchWithAuth } from './api';

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  preferredCurrency: string;
  isPremiumUser: boolean;
  isAdmin: boolean;
  createdAtUtc: string;
  lastLoginAtUtc?: string;
}

export const fetchAllUsers = async (): Promise<AdminUserListItem[]> => {
  const response = await fetchWithAuth('/api/users');
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Benutzerübersicht');
  }
  return await response.json();
};
