export const USER_ROLES = ['ASSISTANT', 'ORGANISER', 'ADMIN'];
/**
 * `password` no figura en este tipo porque la API no la devuelve: el backend
 * aplica un `select` explícito (user_select en user.service.ts) en todas las
 * lecturas, y la guarda hasheada con bcrypt. La interfaz de arriba refleja
 * exactamente ese select.
 */
