import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocioFormPage } from './socio-form.page';

const routes: Routes = [
  {
    path: '',
    component: SocioFormPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocioFormPageRoutingModule {}
