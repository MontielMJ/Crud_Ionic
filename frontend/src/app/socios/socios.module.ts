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
import { SociosPage } from './socios.page';
import { SociosPageRoutingModule } from './socios-routing.module';

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
    SociosPageRoutingModule,
  ],
  declarations: [SociosPage],
})
export class SociosPageModule {}
