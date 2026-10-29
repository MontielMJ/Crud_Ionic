import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { DIAS_POR_PLAN, PlanMembresia, PLANES, SocioPayload } from '../models/socio';
import { SociosService } from '../services/socios.service';
import { mensajeDeError } from '../utils/error';

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

function hoyIso(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;
}

function sumarDias(fecha: string, dias: number): string {
  const base = new Date(`${fecha}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-socio-form',
  templateUrl: 'socio-form.page.html',
  styleUrls: ['socio-form.page.scss'],
  standalone: false,
})
export class SocioFormPage implements OnInit {
  form!: FormGroup;
  esEdicion = false;
  socioId?: number;
  cargando = false;
  guardando = false;
  intentoGuardar = false;
  planes: PlanMembresia[] = PLANES;
  diasPorPlan = DIAS_POR_PLAN;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SociosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);

  get f() {
    return this.form.controls;
  }

  private readonly fechasCoherentes = (group: AbstractControl) => {
    const inicio = group.get('fechaInicio')?.value as string;
    const fin = group.get('fechaVencimiento')?.value as string;
    if (!inicio || !fin) {
      return null;
    }
    // Con formato yyyy-MM-dd la comparación de texto equivale a la de fechas.
    return fin < inicio ? { fechas: true } : null;
  };

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.maxLength(120)]],
        documento: ['', [Validators.required, Validators.maxLength(30)]],
        telefono: ['', Validators.maxLength(30)],
        email: ['', [Validators.email, Validators.maxLength(120)]],
        plan: ['Mensual' as PlanMembresia, Validators.required],
        fechaInicio: [hoyIso(), Validators.required],
        fechaVencimiento: [sumarDias(hoyIso(), DIAS_POR_PLAN.Mensual), Validators.required],
        activo: [true],
        notas: ['', Validators.maxLength(300)],
      },
      { validators: this.fechasCoherentes }
    );

    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.esEdicion = true;
      this.socioId = Number(paramId);
      this.cargarSocio(this.socioId);
    }
  }

  cargarSocio(id: number): void {
    this.cargando = true;
    this.service
      .obtener(id)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (socio) => {
          this.form.patchValue({
            nombre: socio.nombre,
            documento: socio.documento,
            telefono: socio.telefono ?? '',
            email: socio.email ?? '',
            plan: socio.plan,
            fechaInicio: socio.fechaInicio,
            fechaVencimiento: socio.fechaVencimiento,
            activo: socio.activo,
            notas: socio.notas ?? '',
          });
        },
        error: (error) => {
          void this.mostrarToast(mensajeDeError(error, 'No se pudo cargar el socio.'), 'danger');
          this.router.navigate(['/socios']);
        },
      });
  }

  calcularVencimiento(): void {
    const inicio = this.f['fechaInicio'].value as string;
    if (!inicio) {
      void this.mostrarToast('Primero selecciona la fecha de inicio.', 'danger');
      return;
    }
    const plan = this.f['plan'].value as PlanMembresia;
    this.f['fechaVencimiento'].setValue(sumarDias(inicio, DIAS_POR_PLAN[plan]));
    this.f['fechaVencimiento'].markAsTouched();
  }

  guardar(): void {
    this.intentoGuardar = true;

    if (this.form.invalid) {
      return;
    }

    const payload: SocioPayload = {
      nombre: String(this.f['nombre'].value).trim(),
      documento: String(this.f['documento'].value).trim(),
      telefono: String(this.f['telefono'].value ?? '').trim() || null,
      email: String(this.f['email'].value ?? '').trim() || null,
      plan: this.f['plan'].value,
      fechaInicio: this.f['fechaInicio'].value,
      fechaVencimiento: this.f['fechaVencimiento'].value,
      activo: this.f['activo'].value,
      notas: String(this.f['notas'].value ?? '').trim() || null,
    };

    this.guardando = true;
    const request = this.esEdicion
      ? this.service.actualizar(this.socioId!, payload)
      : this.service.crear(payload);

    request.pipe(finalize(() => (this.guardando = false))).subscribe({
      next: () => {
        this.router.navigate(['/socios'], { replaceUrl: true });
        void this.mostrarToast(this.esEdicion ? 'Socio actualizado.' : 'Socio registrado.', 'success');
      },
      error: (error) =>
        this.mostrarToast(mensajeDeError(error, 'Ocurrió un error al guardar el socio.'), 'danger'),
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
