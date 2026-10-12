export type UserRole = 'ASSISTANT' | 'ORGANISER' | 'ADMIN'

/** Un usuario tal como lo devuelve el backend (nunca incluye la contraseña). */
export interface User {
  id: number
  role: UserRole
  doc_type: string
  doc_number: string
  name: string
  surname: string
  email: string
  telephone: string
  cuit: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDTO {
  role?: UserRole
  doc_type: string
  doc_number: string
  name: string
  surname: string
  email: string
  password: string
  telephone: string
  cuit?: string
}

export type UpdateUserDTO = Partial<CreateUserDTO>