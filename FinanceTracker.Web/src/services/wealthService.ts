import { fetchWithAuth } from './api';

export interface BankDto {
  id: string;
  name: string;
  accountCount: number;
  totalBalance: number;
  sortOrder: number;
}

export interface BankReorderDto {
  id: string;
  sortOrder: number;
}

export interface BankCreateUpdateDto {
  name: string;
}

export interface AccountBalanceDto {
  id: string;
  date: string;
  amount: number;
  value?: number;
  factor?: number;
}

export interface AccountDto {
  id: string;
  bankId: string;
  bankName: string;
  name: string;
  type: string;
  currentBalance: number;
  lastBalanceDate?: string;
  history: AccountBalanceDto[];
}

export interface AccountCreateDto {
  bankId: string;
  name: string;
  type: string;
}

export interface AccountUpdateDto {
  name: string;
  type: string;
}

export interface AccountBalanceCreateDto {
  date: string;
  amount: number;
  value?: number;
  factor?: number;
}

export const fetchBanks = async (): Promise<BankDto[]> => {
  const res = await fetchWithAuth('/api/wealth/banks');
  if (!res.ok) throw new Error('Failed to fetch banks');
  return await res.json();
};

export const fetchBank = async (id: string): Promise<BankDto> => {
  const res = await fetchWithAuth(`/api/wealth/banks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch bank');
  return await res.json();
};

export const createBank = async (dto: BankCreateUpdateDto): Promise<BankDto> => {
  const res = await fetchWithAuth('/api/wealth/banks', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to create bank');
  return await res.json();
};

export const updateBank = async (id: string, dto: BankCreateUpdateDto): Promise<void> => {
  const res = await fetchWithAuth(`/api/wealth/banks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update bank');
};

export const deleteBank = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/wealth/banks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete bank');
};

export const reorderBanks = async (orders: BankReorderDto[]): Promise<void> => {
  const res = await fetchWithAuth('/api/wealth/banks/reorder', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orders),
  });
  if (!res.ok) throw new Error('Failed to reorder banks');
};

export const fetchAllAccounts = async (): Promise<AccountDto[]> => {
  const res = await fetchWithAuth('/api/wealth/accounts');
  if (!res.ok) throw new Error('Failed to fetch accounts');
  return await res.json();
};

export const fetchAccountsByBank = async (bankId: string): Promise<AccountDto[]> => {
  const res = await fetchWithAuth(`/api/wealth/banks/${bankId}/accounts`);
  if (!res.ok) throw new Error('Failed to fetch bank accounts');
  return await res.json();
};

export const createAccount = async (dto: AccountCreateDto): Promise<AccountDto> => {
  const res = await fetchWithAuth('/api/wealth/accounts', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to create account');
  return await res.json();
};

export const updateAccount = async (id: string, dto: AccountUpdateDto): Promise<void> => {
  const res = await fetchWithAuth(`/api/wealth/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to update account');
};

export const deleteAccount = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/wealth/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete account');
};

export const addAccountBalance = async (accountId: string, dto: AccountBalanceCreateDto): Promise<AccountBalanceDto> => {
  const res = await fetchWithAuth(`/api/wealth/accounts/${accountId}/balances`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to add balance');
  return await res.json();
};

export const deleteAccountBalance = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/wealth/balances/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete balance');
};
