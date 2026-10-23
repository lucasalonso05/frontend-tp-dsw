import type { User } from '../types/user';

/** La misma regla que el backend: un recurso lo gestiona su dueño o un admin. */
export function canManage(user: User | null, id_owner: number): boolean {
  return user !== null && (user.role === 'ADMIN' || user.id === id_owner);
}
