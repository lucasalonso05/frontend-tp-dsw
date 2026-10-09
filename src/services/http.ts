import type { ApiErrorBody, ValidationIssue } from '../types/api'

/** Error de una llamada al backend, con un mensaje listo para mostrar. */
export class ApiError extends Error {
  status: number
  issues: ValidationIssue[]

  constructor(message: string, status: number, issues: ValidationIssue[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.issues = issues
  }
}

function toApiError(status: number, data: unknown): ApiError {
  const error = (data as ApiErrorBody | null)?.error

  if (Array.isArray(error)) {
    return new ApiError('Hay datos inválidos en el formulario', status, error)
  }
  if (typeof error === 'string' && !error.includes('\n')) {
    return new ApiError(error, status)
  }
  return new ApiError('Ocurrió un error inesperado. Intentá de nuevo.', status)
}

class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body)
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path)
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError('No se pudo conectar con el servidor', 0)
    }

    const data: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      throw toApiError(response.status, data)
    }

    return data as T
  }
}

export const http = new HttpClient(import.meta.env.VITE_API_URL)