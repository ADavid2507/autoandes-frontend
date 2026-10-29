import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Cliente } from '../models/cliente.model';
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  listar() {
    return this.http.get<Cliente[]>(environment.apiUrl + '/clientes');
  }
}
