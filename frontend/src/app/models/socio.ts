export type PlanMembresia = 'Mensual' | 'Trimestral' | 'Anual';

export const PLANES: PlanMembresia[] = ['Mensual', 'Trimestral', 'Anual'];

export const DIAS_POR_PLAN: Record<PlanMembresia, number> = {
  Mensual: 30,
  Trimestral: 90,
  Anual: 365,
};

export type EstadoMembresia = 'Vigente' | 'PorVencer' | 'Vencido' | 'Inactivo';

export interface Socio {
  id: number;
  nombre: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  plan: PlanMembresia;
  /** Fecha sin hora en formato `yyyy-MM-dd`. */
  fechaInicio: string;
  /** Fecha sin hora en formato `yyyy-MM-dd`. */
  fechaVencimiento: string;
  activo: boolean;
  notas: string | null;
  estado: EstadoMembresia;
  diasRestantes: number;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface SocioPayload {
  nombre: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  plan: PlanMembresia;
  fechaInicio: string;
  fechaVencimiento: string;
  activo: boolean;
  notas: string | null;
}

export interface SocioResumen {
  total: number;
  activos: number;
  porVencer: number;
  vencidos: number;
  inactivos: number;
}
