import type { ValidationIssue } from '../types/api';

/** Error de una llamada al backend, con un mensaje listo para mostrar. */
export class ApiError extends Error {
  status: number;

  issues: ValidationIssue[];

  constructor(message: string, status: number, issues: ValidationIssue[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = issues;
  }
}
