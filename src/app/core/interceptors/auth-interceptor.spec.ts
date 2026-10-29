import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { errorInterceptor } from './error-interceptor';
import { AuthService, CLAVE_SESION } from '../auth/auth-service';
import { environment } from '../../../environments/environment';
describe('Interceptores', () => {
  beforeEach(() => {
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({
        token: 'firmado',
        tipo: 'Bearer',
        expiraEnSegundos: 3600,
        expiraEn: Date.now() + 3600000,
        username: 'asesor',
        nombreCompleto: 'Asesor',
        roles: ['ASESOR'],
        permisos: ['ORDEN_LEER'],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });
  it('adjunta el token exclusivamente a la API', () => {
    const http = TestBed.inject(HttpClient),
      mock = TestBed.inject(HttpTestingController);
    http.get(environment.apiUrl + '/ordenes').subscribe();
    expect(
      mock.expectOne(environment.apiUrl + '/ordenes').request.headers.get('Authorization'),
    ).toBe('Bearer firmado');
    mock.match(() => true).forEach((r) => r.flush([]));
    http.get('https://otro.example/datos').subscribe();
    const externa = mock.expectOne('https://otro.example/datos');
    expect(externa.request.headers.has('Authorization')).toBe(false);
    externa.flush([]);
  });
  it.each([401, 403])('maneja HTTP %s sin confundir autenticación y permiso', (status) => {
    const auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    TestBed.inject(HttpClient)
      .get(environment.apiUrl + '/ordenes')
      .subscribe({ error: () => {} });
    TestBed.inject(HttpTestingController)
      .expectOne(environment.apiUrl + '/ordenes')
      .flush({ mensaje: 'rechazo' }, { status, statusText: 'Error' });
    expect(auth.autenticado()).toBe(status === 403);
  });
  it('el 401 del login no ejecuta el cierre por sesión vencida', () => {
    const salir = vi.spyOn(TestBed.inject(AuthService), 'cerrarSesion');
    TestBed.inject(HttpClient)
      .post(environment.apiUrl + '/auth/login', {})
      .subscribe({ error: () => {} });
    TestBed.inject(HttpTestingController)
      .expectOne(environment.apiUrl + '/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(salir).not.toHaveBeenCalled();
  });
});
