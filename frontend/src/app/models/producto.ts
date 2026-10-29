export type Presentacion =
  | 'Capsula'
  | 'Tableta'
  | 'Polvo'
  | 'Liquido'
  | 'Barrita'
  | 'Gomitas'
  | 'Otro';

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  presentacion: Presentacion;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface ProductoPayload {
  nombre: string;
  categoria: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  presentacion: Presentacion;
  activo: boolean;
}

export const PRESENTACIONES: Presentacion[] = [
  'Capsula',
  'Tableta',
  'Polvo',
  'Liquido',
  'Barrita',
  'Gomitas',
  'Otro',
];