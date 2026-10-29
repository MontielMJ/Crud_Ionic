import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { VentaFormPage } from './venta-form.page';
import { VentaFormPageRoutingModule } from './venta-form-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar,
    VentaFormPageRoutingModule,
  ],
  declarations: [VentaFormPage],
})
export class VentaFormPageModule {}
