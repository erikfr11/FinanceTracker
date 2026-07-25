import { fetchWithAuth } from './api';

export interface CategoryDto {
  id: number;
  name: string;
  type: 'Income' | 'Expense' | string;
  expenseType: 'None' | 'Fixed' | 'Variable' | string;
  isSystemCategory: boolean;
  isOwnedByCurrentUser: boolean;
}

export interface CategoryCreateDto {
  name: string;
  type: 'Income' | 'Expense';
  expenseType: 'None' | 'Fixed' | 'Variable';
  isSystemCategory?: boolean;
}

export interface CategoryUpdateDto {
  id: number;
  name: string;
  type: 'Income' | 'Expense';
  expenseType: 'None' | 'Fixed' | 'Variable';
  isSystemCategory?: boolean;
}

export const fetchCategories = async (): Promise<CategoryDto[]> => {
  const response = await fetchWithAuth('/api/categories');
  if (!response.ok) {
    throw new Error('Fehler beim Laden der Kategorien.');
  }
  return await response.json();
};

export const createCategory = async (dto: CategoryCreateDto): Promise<CategoryDto> => {
  const response = await fetchWithAuth('/api/categories', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    let errorText = 'Fehler beim Erstellen der Kategorie.';
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

export const updateCategory = async (dto: CategoryUpdateDto): Promise<void> => {
  const response = await fetchWithAuth(`/api/categories/${dto.id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    throw new Error('Fehler beim Aktualisieren der Kategorie.');
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`/api/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Fehler beim Löschen der Kategorie.');
  }
};
