import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  add,
  calendarOutline,
  cartOutline,
  close,
  create,
  cubeOutline,
  downloadOutline,
  flaskOutline,
  peopleOutline,
  personCircleOutline,
  receiptOutline,
  refresh,
  trash,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    // Con componentes standalone de Ionic los iconos se registran una sola vez al arrancar.
    addIcons({
      add,
      calendarOutline,
      cartOutline,
      close,
      create,
      cubeOutline,
      downloadOutline,
      flaskOutline,
      peopleOutline,
      personCircleOutline,
      receiptOutline,
      refresh,
      trash,
    });
  }
}
