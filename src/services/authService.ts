import type { LoginDTO, Session } from '../types/auth';
import { http } from './http';

export const authService = {
  /** Valida email y contraseña; si son correctos, el backend devuelve el token y el usuario. */
  login(data: LoginDTO): Promise<Session> {
    return http.post<Session>('/auth/login', data);
  },
};
