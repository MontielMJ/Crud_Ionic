import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanMembresia, Socio, SocioPayload, SocioResumen } from '../models/socio';

@Injectable({ providedIn: 'root' })
export class SociosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/socios`;

  listar(buscar?: string, estado?: string): Observable<Socio[]> {
    let params = new HttpParams();
    if (buscar && buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Socio[]>(this.baseUrl, { params });
  }

  resumen(): Observable<SocioResumen> {
    return this.http.get<SocioResumen>(`${this.baseUrl}/resumen`);
  }

  obtener(id: number): Observable<Socio> {
    return this.http.get<Socio>(`${this.baseUrl}/${id}`);
  }

  crear(payload: SocioPayload): Observable<Socio> {
    return this.http.post<Socio>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: SocioPayload): Observable<Socio> {
    return this.http.put<Socio>(`${this.baseUrl}/${id}`, payload);
  }

  renovar(id: number, plan?: PlanMembresia): Observable<Socio> {
    return this.http.post<Socio>(`${this.baseUrl}/${id}/renovar`, { plan: plan ?? null });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
