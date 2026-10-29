import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavComponent } from './shared/nav/nav.component';

@NgModule({
  declarations: [AppComponent, NavComponent],
  imports: [BrowserModule, HttpClientModule, IonApp, IonIcon, IonRouterOutlet, AppRoutingModule],
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
