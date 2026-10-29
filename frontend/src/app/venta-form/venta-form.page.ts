import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { Producto } from '../models/producto';
import { METODOS_PAGO, MetodoPago, VentaPayload } from '../models/venta';
import { ProductosService } from '../services/productos.service';
import { VentasService } from '../services/ventas.service';
import { mensajeDeError } from '../utils/error';

interface LineaCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

@Component({
  selector: 'app-venta-form',
  templateUrl: 'venta-form.page.html',
  styleUrls: ['venta-form.page.scss'],
  standalone: false,
})
export class VentaFormPage implements OnInit {
  form!: FormGroup;
  lineaForm!: FormGroup;

  productos: Producto[] = [];
  carrito: LineaCarrito[] = [];
  metodosPago: MetodoPago[] = METODOS_PAGO;

  cargandoProductos = false;
  guardando = false;
  intentoGuardar = false;
  intentoAgregar = false;

  private readonly fb = inject(FormBuilder);
  private readonly productosService = inject(ProductosService);
  private readonly ventasService = inject(VentasService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  get f() {
    return this.form.controls;
  }

  get lf() {
    return this.lineaForm.controls;
  }

  get cProductoId() {
    return this.lineaForm.get('productoId') as FormControl;
  }

  get cCantidad() {
    return this.lineaForm.get('cantidad') as FormControl;
  }

  get total(): number {
    return this.carrito.reduce((total, l) => total + l.precio * l.cantidad, 0);
  }

  get unidades(): number {
    return this.carrito.reduce((total, l) => total + l.cantidad, 0);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      cliente: ['', [Validators.required, Validators.maxLength(120)]],
      metodoPago: ['Efectivo' as MetodoPago, Validators.required],
      notas: ['', Validators.maxLength(300)],
    });

    this.lineaForm = this.fb.group({
      productoId: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });

    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargandoProductos = true;
    this.productosService
      .listar(undefined, true)
      .pipe(finalize(() => (this.cargandoProductos = false)))
      .subscribe({
        next: (data) => (this.productos = data.filter((p) => p.stock > 0)),
        error: (error) =>
          this.mostrarToast(
            mensajeDeError(error, 'No se pudieron cargar los productos. Verifica que la API esté activa.'),
            'danger'
          ),
      });
  }

  agregarAlCarrito(): void {
    this.intentoAgregar = true;

    if (this.lineaForm.invalid) {
      return;
    }

    const productoId = Number(this.lf['productoId'].value);
    const producto = this.productos.find((p) => p.id === productoId);
    if (!producto) {
      return;
    }

    const cantidad = Number(this.lf['cantidad'].value);
    const existente = this.carrito.find((l) => l.productoId === producto.id);
    const yaEnCarrito = existente?.cantidad ?? 0;

    if (cantidad + yaEnCarrito > producto.stock) {
      this.mostrarToast(
        `Stock insuficiente de "${producto.nombre}": disponible ${producto.stock}, en el carrito ${yaEnCarrito}.`,
        'danger'
      );
      return;
    }

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({
        productoId: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad,
        stock: producto.stock,
      });
    }

    this.lineaForm.reset({ productoId: null, cantidad: 1 });
    this.intentoAgregar = false;
  }

  quitar(productoId: number): void {
    this.carrito = this.carrito.filter((l) => l.productoId !== productoId);
  }

  registrar(): void {
    this.intentoGuardar = true;

    if (this.form.invalid) {
      return;
    }

    if (this.carrito.length === 0) {
      this.mostrarToast('Agrega al menos un producto a la venta.', 'danger');
      return;
    }

    const payload: VentaPayload = {
      cliente: String(this.f['cliente'].value).trim(),
      metodoPago: this.f['metodoPago'].value,
      notas: String(this.f['notas'].value ?? '').trim() || null,
      detalles: this.carrito.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
    };

    this.guardando = true;
    this.ventasService
      .crear(payload)
      .pipe(finalize(() => (this.guardando = false)))
      .subscribe({
        next: () => {
          // Navega primero: esperar la animación del toast puede retrasar o bloquear el regreso al listado.
          this.router.navigate(['/ventas'], { replaceUrl: true });
          void this.mostrarToast('Venta registrada correctamente.', 'success');
        },
        error: (error) =>
          this.mostrarToast(mensajeDeError(error, 'No se pudo registrar la venta.'), 'danger'),
      });
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
