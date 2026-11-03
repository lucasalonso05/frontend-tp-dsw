/** Una categoría tal como la devuelve el backend. */
export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Lo que hay que enviar para crear una categoría. */
export interface CreateCategoryDTO {
  name: string;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
