import { fetchWithAuth } from './api';

export type FixedCostFrequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'SemiAnnually' | 'Yearly';

export interface FixedCostDto {
  id: string;
  amount: number;
  dueDayOfMonth: number;
  frequency: FixedCostFrequency;
  note: string;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  categoryType: string;
  categoryExpenseType: string;
  lastGeneratedYearMonth?: string;
  createdAtUtc: string;
}

export interface FixedCostCreateDto {
  amount: number;
  dueDayOfMonth: number;
  frequency: FixedCostFrequency;
  note: string;
  isActive: boolean;
  categoryId: number;
}

export interface FixedCostUpdateDto {
  id: string;
  amount: number;
  dueDayOfMonth: number;
  frequency: FixedCostFrequency;
  note: string;
  isActive: boolean;
  categoryId: number;
}

export const fetchFixedCosts = async (): Promise<FixedCostDto[]> => {
  const response = await fetchWithAuth('/api/fixedcosts');
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Fixkosten.');
  }
  return await response.json();
};

export const createFixedCost = async (dto: FixedCostCreateDto): Promise<FixedCostDto> => {
  const response = await fetchWithAuth('/api/fixedcosts', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    let errorText = 'Fehler beim Erstellen der Fixkosten-Regel.';
    try {
      const err = await response.json();
      if (err.errors) {
        const messages = Object.values(err.errors).flat() as string[];
        errorText = messages.join(' ');
      } else if (err.detail || err.message || err.title) {
        errorText = err.detail || err.message || err.title;
      }
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
  return await response.json();
};

export const updateFixedCost = async (dto: FixedCostUpdateDto): Promise<void> => {
  const response = await fetchWithAuth(`/api/fixedcosts/${dto.id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    let errorText = 'Fehler beim Aktualisieren der Fixkosten-Regel.';
    try {
      const err = await response.json();
      if (err.detail || err.message || err.title) errorText = err.detail || err.message || err.title;
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
};

export const deleteFixedCost = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/api/fixedcosts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Fehler beim Löschen der Fixkosten-Regel.');
  }
};

export const triggerFixedCostProcessing = async (): Promise<string> => {
  const response = await fetchWithAuth('/api/fixedcosts/process-now', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Fehler beim Ausführen des Fixkosten-Checks.');
  }
  const res = await response.json();
  return res.message;
};
