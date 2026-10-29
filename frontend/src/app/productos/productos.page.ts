import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { Producto } from '../models/producto';
import { ProductosService } from '../services/productos.service';
import { mensajeDeError } from '../utils/error';

@Component({
  selector: 'app-productos',
  templateUrl: 'productos.page.html',
  styleUrls: ['productos.page.scss'],
  standalone: false,
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];
  cargando = false;
  buscar = '';

  private readonly service = inject(ProductosService);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.service
      .listar(this.buscar)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => (this.productos = data),
        error: () => this.mostrarToast('No se pudieron cargar los productos. Verifica que la API esté activa.', 'danger'),
      });
  }

  recargar(event: CustomEvent): void {
    this.service.listar(this.buscar).subscribe({
      next: (data) => {
        this.productos = data;
        event.detail.complete();
      },
      error: () => {
        event.detail.complete();
        this.mostrarToast('No se pudieron cargar los productos.', 'danger');
      },
    });
  }

  async confirmarEliminar(producto: Producto): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: `¿Seguro que deseas eliminar "${producto.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.eliminar(producto.id),
        },
      ],
    });
    await alert.present();
  }

  async eliminar(id: number): Promise<void> {
    this.service.eliminar(id).subscribe({
      next: async () => {
        this.productos = this.productos.filter((p) => p.id !== id);
        await this.mostrarToast('Producto eliminado.', 'success');
      },
      error: (error) =>
        this.mostrarToast(mensajeDeError(error, 'No se pudo eliminar el producto.'), 'danger'),
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