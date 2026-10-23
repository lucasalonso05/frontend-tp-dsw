import type { User } from './user';

export interface LoginDTO {
  email: string;
  password: string;
}

/** Lo que devuelve el login: el token y el usuario que inició sesión. */
export interface Session {
  token: string;
  user: User;
}
