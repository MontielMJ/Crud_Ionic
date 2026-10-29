import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { ProductoFormPage } from './producto-form.page';
import { ProductoFormPageRoutingModule } from './producto-form-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar,
    ProductoFormPageRoutingModule,
  ],
  declarations: [ProductoFormPage],
})
export class ProductoFormPageModule {}
