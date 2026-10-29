import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { DIAS_POR_PLAN, EstadoMembresia, PlanMembresia, Socio, SocioResumen } from '../models/socio';
import { SociosService } from '../services/socios.service';
import { mensajeDeError } from '../utils/error';

type FiltroEstado = '' | 'vigente' | 'porvencer' | 'vencido' | 'inactivo';

@Component({
  selector: 'app-socios',
  templateUrl: 'socios.page.html',
  styleUrls: ['socios.page.scss'],
  standalone: false,
})
export class SociosPage implements OnInit {
  socios: Socio[] = [];
  resumen: SocioResumen = { total: 0, activos: 0, porVencer: 0, vencidos: 0, inactivos: 0 };
  buscar = '';
  estado: FiltroEstado = '';
  cargando = false;

  private readonly service = inject(SociosService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this.cargar();
    this.cargarResumen();
  }

  get hayFiltros(): boolean {
    return !!this.buscar.trim() || !!this.estado;
  }

  cargar(): void {
    this.cargando = true;
    this.service
      .listar(this.buscar, this.estado)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.socios = data),
        error: (error) =>
          this.mostrarToast(
            mensajeDeError(error, 'No se pudieron cargar los socios. Verifica que la API esté activa.'),
            'danger'
          ),
      });
  }

  cargarResumen(): void {
    this.service.resumen().subscribe({
      next: (data) => (this.resumen = data),
      error: () => (this.resumen = { total: 0, activos: 0, porVencer: 0, vencidos: 0, inactivos: 0 }),
    });
  }

  recargar(event: CustomEvent): void {
    this.service.listar(this.buscar, this.estado).subscribe({
      next: (data) => {
        this.socios = data;
        event.detail.complete();
        this.cargarResumen();
      },
      error: (error) => {
        event.detail.complete();
        this.mostrarToast(mensajeDeError(error, 'No se pudieron cargar los socios.'), 'danger');
      },
    });
  }

  cambiarEstado(event: CustomEvent): void {
    this.estado = (event.detail.value ?? '') as FiltroEstado;
    this.cargar();
  }

  limpiarFiltros(): void {
    this.buscar = '';
    this.estado = '';
    this.cargar();
  }

  /** Convierte `yyyy-MM-dd` a texto local sin pasar por zonas horarias. */
  formatearFecha(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  textoVencimiento(socio: Socio): string {
    if (socio.estado === 'Inactivo') {
      return 'Socio inactivo';
    }
    if (socio.diasRestantes < 0) {
      const dias = Math.abs(socio.diasRestantes);
      return `Venció hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }
    if (socio.diasRestantes === 0) {
      return 'Vence hoy';
    }
    return `Vence en ${socio.diasRestantes} ${socio.diasRestantes === 1 ? 'día' : 'días'}`;
  }

  colorEstado(estado: EstadoMembresia): string {
    switch (estado) {
      case 'Vigente':
        return 'success';
      case 'PorVencer':
        return 'warning';
      case 'Vencido':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async confirmarRenovar(socio: Socio): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Renovar membresía',
      message: `Renueva la membresía de "${socio.nombre}". Si aún está vigente se extiende desde el vencimiento actual; si venció, empieza hoy.`,
      inputs: (['Mensual', 'Trimestral', 'Anual'] as PlanMembresia[]).map((plan) => ({
        type: 'radio' as const,
        label: `${plan} (${DIAS_POR_PLAN[plan]} días)`,
        value: plan,
        checked: plan === socio.plan,
      })),
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Renovar',
          handler: (plan: PlanMembresia) => this.renovar(socio.id, plan),
        },
      ],
    });
    await alert.present();
  }

  renovar(id: number, plan: PlanMembresia): void {
    this.service.renovar(id, plan).subscribe({
      next: (actualizado) => {
        this.socios = this.socios.map((s) => (s.id === id ? actualizado : s));
        this.cargarResumen();
        void this.mostrarToast(
          `Membresía renovada hasta el ${this.formatearFecha(actualizado.fechaVencimiento)}.`,
          'success'
        );
      },
      error: (error) => this.mostrarToast(mensajeDeError(error, 'No se pudo renovar la membresía.'), 'danger'),
    });
  }

  async confirmarEliminar(socio: Socio): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar socio',
      message: `¿Seguro que deseas eliminar a "${socio.nombre}" (${socio.documento})?`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(socio.id),
        },
      ],
    });
    await alert.present();
  }

  eliminar(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.socios = this.socios.filter((s) => s.id !== id);
        this.cargarResumen();
        void this.mostrarToast('Socio eliminado.', 'success');
      },
      error: (error) => this.mostrarToast(mensajeDeError(error, 'No se pudo eliminar el socio.'), 'danger'),
    });
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
