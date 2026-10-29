import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { ServiciosService } from './servicio-service';
describe('ServiciosService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('respeta métodos, rutas y DTO del backend', () => {
    const service = TestBed.inject(ServiciosService),
      mock = TestBed.inject(HttpTestingController),
      url = environment.apiUrl + '/servicios',
      body = { codigo: 'SRV-009', nombre: 'Prueba', precio: 50, duracionMin: 30, activo: true };
    service.listar().subscribe();
    mock.expectOne(url).flush([]);
    service.leer(1).subscribe();
    mock.expectOne(url + '/1').flush({});
    service.crear(body).subscribe();
    const crear = mock.expectOne(url);
    expect(crear.request.method).toBe('POST');
    expect(crear.request.body).toEqual(body);
    crear.flush({});
    service.actualizar(1, body).subscribe();
    const editar = mock.expectOne(url + '/1');
    expect(editar.request.method).toBe('PUT');
    editar.flush({});
    service.eliminar(1).subscribe();
    const eliminar = mock.expectOne(url + '/1');
    expect(eliminar.request.method).toBe('DELETE');
    eliminar.flush(null);
    service.estado(1, false).subscribe();
    const estado = mock.expectOne(url + '/1/estado');
    expect(estado.request.method).toBe('PATCH');
    expect(estado.request.body).toEqual({ activo: false });
    estado.flush({});
  });
});
