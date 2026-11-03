import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category';
import { CrudService } from './CrudService';

export const categoryService = new CrudService<Category, CreateCategoryDTO, UpdateCategoryDTO>(
  '/categories',
);
