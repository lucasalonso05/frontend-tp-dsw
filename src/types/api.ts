/** Un problema de validación, tal como lo devuelve Zod en el backend. */
export interface ValidationIssue {
  code: string
  path: (string | number)[]
  message: string
}

/** Cuerpo de cualquier respuesta de error del backend. */
export interface ApiErrorBody {
  error: string | ValidationIssue[]
}