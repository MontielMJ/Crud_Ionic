import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonBadge,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonRouterLink,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { UsuariosPage } from './usuarios.page';
import { UsuariosPageRoutingModule } from './usuarios-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonBadge,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonRouterLink,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    UsuariosPageRoutingModule,
  ],
  declarations: [UsuariosPage],
})
export class UsuariosPageModule {}
