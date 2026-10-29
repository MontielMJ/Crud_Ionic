import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SociosPage } from './socios.page';

const routes: Routes = [
  {
    path: '',
    component: SociosPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SociosPageRoutingModule {}
