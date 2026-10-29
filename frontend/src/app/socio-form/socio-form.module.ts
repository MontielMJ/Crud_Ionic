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
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { SocioFormPage } from './socio-form.page';
import { SocioFormPageRoutingModule } from './socio-form-routing.module';

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
    IonToggle,
    IonToolbar,
    SocioFormPageRoutingModule,
  ],
  declarations: [SocioFormPage],
})
export class SocioFormPageModule {}
