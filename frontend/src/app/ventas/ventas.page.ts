import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { Venta } from '../models/venta';
import { VentasService } from '../services/ventas.service';
import { mensajeDeError } from '../utils/error';

@Component({
  selector: 'app-ventas',
  templateUrl: 'ventas.page.html',
  styleUrls: ['ventas.page.scss'],
  standalone: false,
})
export class VentasPage implements OnInit {
  ventas: Venta[] = [];
  cargando = false;
  buscar = '';

  /** Filtro por rango de fechas (valores `yyyy-mm-dd` del input date). */
  desde = '';
  hasta = '';

  /** Venta mostrada en el modal de detalle. */
  ventaSeleccionada: Venta | null = null;

  private readonly service = inject(VentasService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this.cargar();
  }

  get totalVendido(): number {
    return this.ventas.reduce((total, venta) => total + Number(venta.total), 0);
  }

  get unidadesVendidas(): number {
    return this.ventas.reduce(
      (total, venta) => total + venta.detalles.reduce((suma, d) => suma + d.cantidad, 0),
      0
    );
  }

  get hayFiltros(): boolean {
    return !!this.buscar.trim() || !!this.desde || !!this.hasta;
  }

  cargar(): void {
    this.cargando = true;
    this.service
      .listar(this.buscar, this.inicioDelDia(this.desde), this.finDelDia(this.hasta))
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.ventas = data),
        error: (error) =>
          this.mostrarToast(
            mensajeDeError(error, 'No se pudieron cargar las ventas. Verifica que la API esté activa.'),
            'danger'
          ),
      });
  }

  recargar(event: CustomEvent): void {
    this.service
      .listar(this.buscar, this.inicioDelDia(this.desde), this.finDelDia(this.hasta))
      .subscribe({
        next: (data) => {
          this.ventas = data;
          event.detail.complete();
        },
        error: (error) => {
          event.detail.complete();
          this.mostrarToast(mensajeDeError(error, 'No se pudieron cargar las ventas.'), 'danger');
        },
      });
  }

  limpiarFiltros(): void {
    this.buscar = '';
    this.desde = '';
    this.hasta = '';
    this.cargar();
  }

  abrirDetalle(venta: Venta): void {
    this.ventaSeleccionada = venta;
  }

  cerrarDetalle(): void {
    this.ventaSeleccionada = null;
  }

  /** La API guarda las fechas en UTC y las devuelve sin zona horaria. */
  fechaLocal(fecha: string): Date {
    return new Date(/[zZ]$/.test(fecha) ? fecha : `${fecha}Z`);
  }

  async confirmarCancelar(venta: Venta): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar venta',
      message: `¿Cancelar la venta de "${venta.cliente}" por ${venta.total.toFixed(
        2
      )}? Las unidades vendidas se devolverán al stock.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Cancelar venta',
          role: 'destructive',
          handler: () => this.cancelar(venta.id),
        },
      ],
    });
    await alert.present();
  }

  cancelar(id: number): void {
    this.service.eliminar(id).subscribe({
      next: async () => {
        this.ventas = this.ventas.filter((v) => v.id !== id);
        if (this.ventaSeleccionada?.id === id) {
          this.ventaSeleccionada = null;
        }
        await this.mostrarToast('Venta cancelada y stock restaurado.', 'success');
      },
      error: (error) =>
        this.mostrarToast(mensajeDeError(error, 'No se pudo cancelar la venta.'), 'danger'),
    });
  }

  /** CSV de las ventas visibles (respeta la búsqueda y el rango de fechas). */
  generarCsv(): string {
    const encabezado = [
      'Venta',
      'Fecha',
      'Cliente',
      'Metodo de pago',
      'Unidades',
      'Total',
      'Notas',
      'Detalle',
    ];

    const filas = this.ventas.map((v) => [
      String(v.id),
      this.formatearFecha(this.fechaLocal(v.fecha)),
      v.cliente,
      v.metodoPago,
      String(v.detalles.reduce((suma, d) => suma + d.cantidad, 0)),
      v.total.toFixed(2),
      v.notas ?? '',
      v.detalles.map((d) => `${d.cantidad}x ${d.productoNombre} (${d.subtotal.toFixed(2)})`).join(' | '),
    ]);

    // Separador ";" para que Excel en español no parta los decimales.
    return [encabezado, ...filas].map((fila) => fila.map((c) => this.escaparCsv(c)).join(';')).join('\r\n');
  }

  exportarCsv(): void {
    if (this.ventas.length === 0) {
      this.mostrarToast('No hay ventas para exportar con los filtros actuales.', 'danger');
      return;
    }

    const contenido = `\uFEFF${this.generarCsv()}`;
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `ventas-${this.marcaDeTiempo()}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);

    this.mostrarToast(`Se exportaron ${this.ventas.length} ventas a CSV.`, 'success');
  }

  private escaparCsv(valor: string): string {
    const texto = String(valor ?? '');
    return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  }

  private formatearFecha(fecha: Date): string {
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(
      fecha.getHours()
    )}:${dos(fecha.getMinutes())}`;
  }

  private marcaDeTiempo(): string {
    const ahora = new Date();
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${ahora.getFullYear()}${dos(ahora.getMonth() + 1)}${dos(ahora.getDate())}-${dos(
      ahora.getHours()
    )}${dos(ahora.getMinutes())}`;
  }

  private inicioDelDia(fecha: string): string | undefined {
    return fecha ? new Date(`${fecha}T00:00:00`).toISOString() : undefined;
  }

  private finDelDia(fecha: string): string | undefined {
    return fecha ? new Date(`${fecha}T23:59:59.999`).toISOString() : undefined;
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
