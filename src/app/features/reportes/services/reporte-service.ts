import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Ingreso } from '../models/ingreso.model';
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  ingresos(desde: string, hasta: string) {
    return this.http.get<Ingreso[]>(environment.apiUrl + '/reportes/ingresos-por-servicio', {
      params: { desde, hasta },
    });
  }
}
