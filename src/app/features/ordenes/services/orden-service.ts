import { PaginaResponse, Direccion } from '../../../core/models/pagina-response';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Orden, OrdenRequest } from '../models/orden.model';
@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/ordenes';
  listar(filtros: Record<string, string> = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros))
      if (valor) params = params.set(clave, valor);
    return this.http.get<Orden[]>(this.url, { params });
  }
  leer(id: number) {
    return this.http.get<Orden>(`${this.url}/${id}`);
  }
  registrar(body: OrdenRequest) {
    return this.http.post<Orden>(this.url, body);
  }
  anular(id: number, motivo: string) {
    return this.http.patch<Orden>(`${this.url}/${id}/anular`, { motivo });
  }

  listarPaginado(
    pagina = 0,
    tamanio = 5,
    ordenarPor = 'fecha',
    direccion: Direccion = 'desc',
    filtros: Record<string, string> = {},
  ) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);
    for (const [clave, valor] of Object.entries(filtros))
      if (valor) params = params.set(clave, valor);
    return this.http.get<PaginaResponse<Orden>>(this.url + '/paginado', { params });
  }
}
