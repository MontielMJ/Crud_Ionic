export type RolUsuario = 'Administrador' | 'Recepcionista' | 'Entrenador';

export const ROLES: RolUsuario[] = ['Administrador', 'Recepcionista', 'Entrenador'];

export interface Usuario {
  id: number;
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface UsuarioPayload {
  nombre: string;
  nombreUsuario: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  /** Sólo se envía al crear o al cambiar la contraseña. */
  password?: string | null;
}
