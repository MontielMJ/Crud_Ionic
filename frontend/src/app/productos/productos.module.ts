import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
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
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { ProductosPage } from './productos.page';
import { ProductosPageRoutingModule } from './productos-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonBadge,
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
    IonText,
    IonTitle,
    IonToolbar,
    ProductosPageRoutingModule,
  ],
  declarations: [ProductosPage],
})
export class ProductosPageModule {}
