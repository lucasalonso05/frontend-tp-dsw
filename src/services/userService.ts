import type { CreateUserDTO, UpdateUserDTO, User } from '../types/user'
import { CrudService } from './CrudService'

export const userService = new CrudService<User, CreateUserDTO, UpdateUserDTO>('/users')