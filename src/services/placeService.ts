import type { CreatePlaceDTO, Place, UpdatePlaceDTO } from '../types/place'
import { CrudService } from './CrudService'

export const placeService = new CrudService<Place, CreatePlaceDTO, UpdatePlaceDTO>('/places')