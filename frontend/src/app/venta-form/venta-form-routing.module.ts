import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentaFormPage } from './venta-form.page';

const routes: Routes = [
  {
    path: '',
    component: VentaFormPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VentaFormPageRoutingModule {}
