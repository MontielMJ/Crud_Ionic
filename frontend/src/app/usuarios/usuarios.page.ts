import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { RolUsuario, Usuario } from '../models/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { mensajeDeError } from '../utils/error';

@Component({
  selector: 'app-usuarios',
  templateUrl: 'usuarios.page.html',
  styleUrls: ['usuarios.page.scss'],
  standalone: false,
})
export class UsuariosPage implements OnInit {
  usuarios: Usuario[] = [];
  buscar = '';
  rol: '' | RolUsuario = '';
  cargando = false;

  private readonly service = inject(UsuariosService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this.cargar();
  }

  get totalActivos(): number {
    return this.usuarios.filter((u) => u.activo).length;
  }

  get totalAdmins(): number {
    return this.usuarios.filter((u) => u.rol === 'Administrador').length;
  }

  get hayFiltros(): boolean {
    return !!this.buscar.trim() || !!this.rol;
  }

  cargar(): void {
    this.cargando = true;
    this.service
      .listar(this.buscar, this.rol)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.usuarios = data),
        error: (error) =>
          this.mostrarToast(
            mensajeDeError(error, 'No se pudieron cargar los usuarios. Verifica que la API esté activa.'),
            'danger'
          ),
      });
  }

  recargar(event: CustomEvent): void {
    this.service.listar(this.buscar, this.rol).subscribe({
      next: (data) => {
        this.usuarios = data;
        event.detail.complete();
      },
      error: (error) => {
        event.detail.complete();
        this.mostrarToast(mensajeDeError(error, 'No se pudieron cargar los usuarios.'), 'danger');
      },
    });
  }

  cambiarRol(event: CustomEvent): void {
    this.rol = (event.detail.value ?? '') as '' | RolUsuario;
    this.cargar();
  }

  colorRol(rol: RolUsuario): string {
    switch (rol) {
      case 'Administrador':
        return 'danger';
      case 'Recepcionista':
        return 'primary';
      default:
        return 'tertiary';
    }
  }

  iniciales(nombre: string): string {
    return nombre
      .split(/\s+/)
      .filter((parte) => !!parte)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join('');
  }

  async confirmarEliminar(usuario: Usuario): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar la cuenta de "${usuario.nombre}" (${usuario.nombreUsuario})? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Volver', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(usuario.id),
        },
      ],
    });
    await alert.present();
  }

  eliminar(id: number): void {
    this.service.eliminar(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter((u) => u.id !== id);
        void this.mostrarToast('Usuario eliminado.', 'success');
      },
      error: (error) => this.mostrarToast(mensajeDeError(error, 'No se pudo eliminar el usuario.'), 'danger'),
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
