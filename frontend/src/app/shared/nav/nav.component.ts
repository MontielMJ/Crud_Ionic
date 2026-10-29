import { Component, inject, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface SeccionNav {
  ruta: string;
  etiqueta: string;
  icono: string;
  seccion: string;
}

const SECCIONES: SeccionNav[] = [
  { ruta: '/productos', etiqueta: 'Productos', icono: 'cube-outline', seccion: 'productos' },
  { ruta: '/ventas', etiqueta: 'Ventas', icono: 'cart-outline', seccion: 'ventas' },
  { ruta: '/socios', etiqueta: 'Socios', icono: 'people-outline', seccion: 'socios' },
  { ruta: '/usuarios', etiqueta: 'Usuarios', icono: 'person-circle-outline', seccion: 'usuarios' },
];

/** Relaciona cada ruta (incluidos los formularios) con la sección que debe resaltarse. */
const SECCION_POR_RUTA: Record<string, string> = {
  productos: 'productos',
  'producto-form': 'productos',
  ventas: 'ventas',
  'venta-form': 'ventas',
  socios: 'socios',
  'socio-form': 'socios',
  usuarios: 'usuarios',
  'usuario-form': 'usuarios',
};

@Component({
  selector: 'app-nav',
  templateUrl: 'nav.component.html',
  styleUrls: ['nav.component.scss'],
  standalone: false,
})
export class NavComponent implements OnDestroy {
  secciones: SeccionNav[] = SECCIONES;
  activa = 'productos';

  private readonly router = inject(Router);
  private readonly sub: Subscription;

  constructor() {
    this.actualizar(this.router.url);
    this.sub = this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => this.actualizar(evento.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private actualizar(url: string): void {
    const segmento = url.split('?')[0].split('/').filter(Boolean)[0] ?? '';
    this.activa = SECCION_POR_RUTA[segmento] ?? 'productos';
  }
}
