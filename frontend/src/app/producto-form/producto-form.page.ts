import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { Presentacion, PRESENTACIONES, ProductoPayload } from '../models/producto';
import { ProductosService } from '../services/productos.service';
import { mensajeDeError } from '../utils/error';

@Component({
  selector: 'app-producto-form',
  templateUrl: 'producto-form.page.html',
  styleUrls: ['producto-form.page.scss'],
  standalone: false,
})
export class ProductoFormPage implements OnInit {
  form!: FormGroup;
  esEdicion = false;
  productoId?: number;
  cargando = false;
  guardando = false;
  intentoGuardar = false;
  presentaciones: Presentacion[] = PRESENTACIONES;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      categoria: ['', [Validators.required, Validators.maxLength(60)]],
      descripcion: ['', Validators.maxLength(500)],
      precio: [0, [Validators.required, Validators.min(0), Validators.max(1_000_000)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      presentacion: ['Capsula' as Presentacion, Validators.required],
      activo: [true],
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.esEdicion = true;
      this.productoId = Number(paramId);
      this.cargarProducto(this.productoId);
    }
  }

  cargarProducto(id: number): void {
    this.cargando = true;
    this.service
      .obtener(id)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (producto) => {
          this.form.patchValue({
            nombre: producto.nombre,
            categoria: producto.categoria,
            descripcion: producto.descripcion ?? '',
            precio: producto.precio,
            stock: producto.stock,
            presentacion: producto.presentacion,
            activo: producto.activo,
          });
        },
        error: async () => {
          await this.mostrarToast('No se pudo cargar el producto.', 'danger');
          this.router.navigate(['/productos']);
        },
      });
  }

  guardar(): void {
    this.intentoGuardar = true;

    if (this.form.invalid) {
      return;
    }

    const payload: ProductoPayload = {
      nombre: this.f['nombre'].value.trim(),
      categoria: this.f['categoria'].value.trim(),
      descripcion: this.f['descripcion'].value?.trim() || null,
      precio: Number(this.f['precio'].value),
      stock: Number(this.f['stock'].value),
      presentacion: this.f['presentacion'].value,
      activo: this.f['activo'].value,
    };

    this.guardando = true;
    const request = this.esEdicion
      ? this.service.actualizar(this.productoId!, payload)
      : this.service.crear(payload);

    request.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.router.navigate(['/productos'], { replaceUrl: true });
        void this.mostrarToast(
          this.esEdicion ? 'Producto actualizado.' : 'Producto creado.',
          'success'
        );
      },
      error: (error) =>
        this.mostrarToast(mensajeDeError(error, 'Ocurrió un error al guardar el producto.'), 'danger'),
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