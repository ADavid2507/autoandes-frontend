import { PaginaResponse, Direccion } from '../../../core/models/pagina-response';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Vehiculo, VehiculoRequest } from '../models/vehiculo.model';
@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/vehiculos';
  listar(clienteId?: number) {
    return this.http.get<Vehiculo[]>(this.url, { params: clienteId ? { clienteId } : {} });
  }
  leer(id: number) {
    return this.http.get<Vehiculo>(`${this.url}/${id}`);
  }
  crear(body: VehiculoRequest) {
    return this.http.post<Vehiculo>(this.url, body);
  }
  actualizar(id: number, body: VehiculoRequest) {
    return this.http.put<Vehiculo>(`${this.url}/${id}`, body);
  }
  eliminar(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  listarPaginado(
    pagina = 0,
    tamanio = 5,
    ordenarPor = 'placa',
    direccion: Direccion = 'asc',
    buscar = '',
    clienteId?: number,
  ) {
    const params: Record<string, string | number> = { pagina, tamanio, ordenarPor, direccion };
    if (buscar.trim()) params['buscar'] = buscar.trim();
    if (clienteId) params['clienteId'] = clienteId;
    return this.http.get<PaginaResponse<Vehiculo>>(this.url + '/paginado', { params });
  }
}
