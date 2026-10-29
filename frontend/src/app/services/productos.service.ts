import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ProductoPayload } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/productos`;

  listar(buscar?: string, activo?: boolean): Observable<Producto[]> {
    let params = new HttpParams();
    if (buscar && buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }
    if (activo !== undefined) {
      params = params.set('activo', String(activo));
    }
    return this.http.get<Producto[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  crear(payload: ProductoPayload): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: ProductoPayload): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}