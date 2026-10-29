import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { RolUsuario, ROLES, UsuarioPayload } from '../models/usuario';
import { UsuariosService } from '../services/usuarios.service';
import { mensajeDeError } from '../utils/error';

@Component({
  selector: 'app-usuario-form',
  templateUrl: 'usuario-form.page.html',
  styleUrls: ['usuario-form.page.scss'],
  standalone: false,
})
export class UsuarioFormPage implements OnInit {
  form!: FormGroup;
  esEdicion = false;
  usuarioId?: number;
  cargando = false;
  guardando = false;
  intentoGuardar = false;
  roles: RolUsuario[] = ROLES;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  get f() {
    return this.form.controls;
  }

  private readonly clavesCoinciden = (group: AbstractControl) => {
    const password = group.get('password')?.value as string;
    const confirmar = group.get('confirmarPassword')?.value as string;
    if (!password && !confirmar) {
      return null;
    }
    return password === confirmar ? null : { claves: true };
  };

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    this.esEdicion = !!paramId;
    this.usuarioId = paramId ? Number(paramId) : undefined;

    const validadoresPassword = this.esEdicion
      ? [Validators.minLength(8), Validators.maxLength(100)]
      : [Validators.required, Validators.minLength(8), Validators.maxLength(100)];

    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(120)]],
        nombreUsuario: ['', [Validators.required, Validators.maxLength(60)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
        rol: ['Recepcionista' as RolUsuario, Validators.required],
        activo: [true],
        password: ['', validadoresPassword],
        confirmarPassword: [''],
      },
      { validators: this.clavesCoinciden }
    );

    if (this.esEdicion) {
      this.cargarUsuario(this.usuarioId!);
    }
  }

  cargarUsuario(id: number): void {
    this.cargando = true;
    this.service
      .obtener(id)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (usuario) => {
          this.form.patchValue({
            nombre: usuario.nombre,
            nombreUsuario: usuario.nombreUsuario,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
          });
        },
        error: (error) => {
          void this.mostrarToast(mensajeDeError(error, 'No se pudo cargar el usuario.'), 'danger');
          this.router.navigate(['/usuarios']);
        },
      });
  }

  guardar(): void {
    this.intentoGuardar = true;

    if (this.form.invalid) {
      return;
    }

    const password = String(this.f['password'].value ?? '').trim();

    const payload: UsuarioPayload = {
      nombre: String(this.f['nombre'].value).trim(),
      nombreUsuario: String(this.f['nombreUsuario'].value).trim(),
      email: String(this.f['email'].value).trim(),
      rol: this.f['rol'].value,
      activo: this.f['activo'].value,
      password: password || null,
    };

    this.guardando = true;
    const request = this.esEdicion
      ? this.service.actualizar(this.usuarioId!, payload)
      : this.service.crear(payload);

    request.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.router.navigate(['/usuarios'], { replaceUrl: true });
        void this.mostrarToast(
          this.esEdicion ? 'Usuario actualizado.' : 'Usuario creado.',
          'success'
        );
      },
      error: (error) =>
        this.mostrarToast(mensajeDeError(error, 'Ocurrió un error al guardar el usuario.'), 'danger'),
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
