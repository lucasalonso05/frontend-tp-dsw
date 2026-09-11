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

/**
 * Sin `id_user`: el backend toma el dueño del JWT, no del body. Mandarlo se
 * ignora. Solo un ORGANISER (o un ADMIN) puede crear.
 */
export interface CreatePlaceDTO {
  name: string
  capacity: number
  description?: string
  province: string
  city: string
  street: string
  street_number: string
  zip_code: string
}

export type UpdatePlaceDTO = Partial<CreatePlaceDTO>
