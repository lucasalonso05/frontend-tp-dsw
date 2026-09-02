//Describe protocolo, no dominio

export type ISODateTime = string

export type DecimalString = string

export interface ValidationIssue {
  code: string
  path: (string | number)[]
  message: string
}

export interface ApiError {
  error: string | ValidationIssue[]
}

export interface MessageResponse {
  mensaje: string
}
