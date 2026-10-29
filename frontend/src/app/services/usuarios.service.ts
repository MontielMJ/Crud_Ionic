import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioPayload } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/usuarios`;

  listar(buscar?: string, rol?: string): Observable<Usuario[]> {
    let params = new HttpParams();
    if (buscar && buscar.trim()) {
      params = params.set('buscar', buscar.trim());
    }
    if (rol) {
      params = params.set('rol', rol);
    }
    return this.http.get<Usuario[]>(this.baseUrl, { params });
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  crear(payload: UsuarioPayload): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, payload);
  }

  actualizar(id: number, payload: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, payload);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
