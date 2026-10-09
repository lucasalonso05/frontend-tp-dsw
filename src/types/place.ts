/** Un lugar tal como lo devuelve el backend. */
export interface Place {
  id: number
  name: string
  capacity: number
  description: string | null
  province: string
  city: string
  street: string
  street_number: string
  zip_code: string
  id_user: number
  createdAt: string
  updatedAt: string
}

/** Lo que hay que enviar para crear un lugar. */
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