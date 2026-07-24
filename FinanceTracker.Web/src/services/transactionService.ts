import { fetchWithAuth } from './api';

export interface TransactionDto {
  id: string;
  amount: number;
  date: string;
  note: string;
  categoryId: number;
  categoryName: string;
  categoryType: 'Income' | 'Expense' | string;
  categoryExpenseType: 'None' | 'Fixed' | 'Variable' | string;
}

export interface TransactionCreateDto {
  amount: number;
  date: string;
  note: string;
  categoryId: number;
}

export interface TransactionUpdateDto {
  id: string;
  amount: number;
  date: string;
  note: string;
  categoryId: number;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  type?: string;
}

export const fetchTransactions = async (filter?: TransactionFilter): Promise<TransactionDto[]> => {
  const params = new URLSearchParams();
  if (filter?.startDate) params.append('startDate', filter.startDate);
  if (filter?.endDate) params.append('endDate', filter.endDate);
  if (filter?.categoryId) params.append('categoryId', filter.categoryId.toString());
  if (filter?.type) params.append('type', filter.type);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithAuth(`/api/transactions${query}`);
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Transaktionen.');
  }
  return await response.json();
};

export const createTransaction = async (dto: TransactionCreateDto): Promise<TransactionDto> => {
  const response = await fetchWithAuth('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    let errorText = 'Fehler beim Erstellen der Transaktion.';
    try {
      const err = await response.json();
      if (err.title || err.detail) errorText = err.detail || err.title;
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
  return await response.json();
};

export const updateTransaction = async (dto: TransactionUpdateDto): Promise<void> => {
  const response = await fetchWithAuth(`/api/transactions/${dto.id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    throw new Error('Fehler beim Aktualisieren der Transaktion.');
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Fehler beim Löschen der Transaktion.');
  }
};
