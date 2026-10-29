import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venta, VentaPayload } from '../models/venta';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/ventas`;

  listar(buscar?: string, desde?: string, hasta?: string): Observable<Venta[]> {
    let params = new HttpParams();
    if (buscar && buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<Venta[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.baseUrl}/${id}`);
  }

  crear(payload: VentaPayload): Observable<Venta> {
    return this.http.post<Venta>(this.baseUrl, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
