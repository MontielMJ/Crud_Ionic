import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { UsuarioFormPage } from './usuario-form.page';
import { UsuarioFormPageRoutingModule } from './usuario-form-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToggle,
    IonToolbar,
    UsuarioFormPageRoutingModule,
  ],
  declarations: [UsuarioFormPage],
})
export class UsuarioFormPageModule {}
