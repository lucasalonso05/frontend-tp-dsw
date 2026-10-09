import { http } from './http'

/** Las cinco operaciones que comparten todos los recursos del backend. */
export class CrudService<T, CreateDTO, UpdateDTO> {
  protected path: string

  constructor(path: string) {
    this.path = path
  }

  getAll(): Promise<T[]> {
    return http.get<T[]>(this.path)
  }

  getById(id: number): Promise<T> {
    return http.get<T>(`${this.path}/${id}`)
  }

  create(data: CreateDTO): Promise<T> {
    return http.post<T>(this.path, data)
  }

  update(id: number, data: UpdateDTO): Promise<T> {
    return http.put<T>(`${this.path}/${id}`, data)
  }

  async remove(id: number): Promise<void> {
    await http.delete<unknown>(`${this.path}/${id}`)
  }
}