import type { Category } from '../types/category';

/** "Discoteca" y "DiscoTeca" son la misma categoría. El backend valida lo mismo. */
export function sameCategoryName(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
}

/**
 * Busca una categoría ya cargada con ese nombre, sin distinguir mayúsculas.
 * `skipId` deja afuera una categoría: al editarla, no tiene que chocar consigo misma.
 */
export function findCategoryByName(
  categories: Category[],
  name: string,
  skipId: number | null = null,
): Category | undefined {
  return categories.find(
    (category) => category.id !== skipId && sameCategoryName(category.name, name),
  );
}
