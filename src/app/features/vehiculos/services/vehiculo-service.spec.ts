import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { VehiculosService } from './vehiculo-service';
describe('VehiculosService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('respeta métodos, rutas y DTO del backend', () => {
    const service = TestBed.inject(VehiculosService),
      mock = TestBed.inject(HttpTestingController),
      url = environment.apiUrl + '/vehiculos',
      body = { placa: 'ZZZ-999', marca: 'Toyota', modelo: 'Yaris', anio: 2020, clienteId: 1 };
    service.listar(2).subscribe();
    const lista = mock.expectOne((r) => r.url === url);
    expect(lista.request.params.get('clienteId')).toBe('2');
    lista.flush([]);
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
  });
});
