export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export const METODOS_PAGO: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Transferencia'];

export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  cliente: string;
  metodoPago: MetodoPago;
  notas: string | null;
  fecha: string;
  total: number;
  detalles: DetalleVenta[];
}

export interface VentaPayload {
  cliente: string;
  metodoPago: MetodoPago;
  notas: string | null;
  detalles: { productoId: number; cantidad: number }[];
}
