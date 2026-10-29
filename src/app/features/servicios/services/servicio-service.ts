import { PaginaResponse, Direccion } from '../../../core/models/pagina-response';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Servicio, ServicioRequest } from '../models/servicio.model';
@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/servicios';
  listar() {
    return this.http.get<Servicio[]>(this.url);
  }
  leer(id: number) {
    return this.http.get<Servicio>(`${this.url}/${id}`);
  }
  crear(body: ServicioRequest) {
    return this.http.post<Servicio>(this.url, body);
  }
  actualizar(id: number, body: ServicioRequest) {
    return this.http.put<Servicio>(`${this.url}/${id}`, body);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  estado(id: number, activo: boolean) {
    return this.http.patch<Servicio>(`${this.url}/${id}/estado`, { activo });
  }

  listarPaginado(
    pagina = 0,
    tamanio = 5,
    ordenarPor = 'nombre',
    direccion: Direccion = 'asc',
    buscar = '',
  ) {
    const params: Record<string, string | number> = { pagina, tamanio, ordenarPor, direccion };
    if (buscar.trim()) params['buscar'] = buscar.trim();

    return this.http.get<PaginaResponse<Servicio>>(this.url + '/paginado', { params });
  }
}
