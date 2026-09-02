import type { ISODateTime } from './api'


/** Lugar físico donde se realiza un evento. Pertenece a un usuario. */
export interface Place {
  id: number
  name: string
  /** Aforo máximo. Ningún evento del lugar puede declarar más stock que esto. */
  capacity: number
  description: string | null
  province: string
  city: string
  street: string
  street_number: string
  zip_code: string
  /** Dueño del lugar. */
  id_user: number
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export interface CreatePlaceDTO {
  name: string
  capacity: number
  description?: string
  province: string
  city: string
  street: string
  street_number: string
  zip_code: string
  id_user: number
}

export type UpdatePlaceDTO = Partial<CreatePlaceDTO>
