import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'productos',
    loadChildren: () => import('./productos/productos.module').then((m) => m.ProductosPageModule),
  },
  {
    path: 'producto-form',
    loadChildren: () =>
      import('./producto-form/producto-form.module').then((m) => m.ProductoFormPageModule),
  },
  {
    path: 'producto-form/:id',
    loadChildren: () =>
      import('./producto-form/producto-form.module').then((m) => m.ProductoFormPageModule),
  },
  {
    path: 'ventas',
    loadChildren: () => import('./ventas/ventas.module').then((m) => m.VentasPageModule),
  },
  {
    path: 'venta-form',
    loadChildren: () =>
      import('./venta-form/venta-form.module').then((m) => m.VentaFormPageModule),
  },
  {
    path: 'socios',
    loadChildren: () => import('./socios/socios.module').then((m) => m.SociosPageModule),
  },
  {
    path: 'socio-form',
    loadChildren: () =>
      import('./socio-form/socio-form.module').then((m) => m.SocioFormPageModule),
  },
  {
    path: 'socio-form/:id',
    loadChildren: () =>
      import('./socio-form/socio-form.module').then((m) => m.SocioFormPageModule),
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuarios/usuarios.module').then((m) => m.UsuariosPageModule),
  },
  {
    path: 'usuario-form',
    loadChildren: () =>
      import('./usuario-form/usuario-form.module').then((m) => m.UsuarioFormPageModule),
  },
  {
    path: 'usuario-form/:id',
    loadChildren: () =>
      import('./usuario-form/usuario-form.module').then((m) => m.UsuarioFormPageModule),
  },
  {
    path: '',
    redirectTo: 'productos',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}