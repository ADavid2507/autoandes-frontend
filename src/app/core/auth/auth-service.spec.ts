import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, CLAVE_SESION } from './auth-service';
import { environment } from '../../../environments/environment';
const response = {
  token: 'firmado',
  tipo: 'Bearer',
  expiraEnSegundos: 3600,
  username: 'asesor',
  nombreCompleto: 'Asesor',
  roles: ['ASESOR'],
  permisos: ['ORDEN_LEER'],
};
describe('AuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
    vi.useRealTimers();
  });
  it('persiste la sesión con vencimiento sin guardar la contraseña', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('asesor', 'secreta').subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/login');
    expect(req.request.body).toEqual({ username: 'asesor', password: 'secreta' });
    req.flush(response);
    expect(auth.tienePermiso('ORDEN_LEER')).toBe(true);
    expect(auth.tienePermiso('ORDEN_ANULAR')).toBe(false);
    const storage = sessionStorage.getItem(CLAVE_SESION)!;
    expect(storage).not.toContain('secreta');
    expect(JSON.parse(storage).expiraEn).toBeGreaterThan(Date.now());
  });
  it.each([
    '{malformado',
    JSON.stringify({ ...response, expiraEn: 1 }),
    JSON.stringify({ ...response, expiraEn: 'incorrecto' }),
  ])('descarta sesión inválida: %s', (value) => {
    sessionStorage.setItem(CLAVE_SESION, value);
    expect(TestBed.inject(AuthService).sesion()).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
  });
  it('cierra automáticamente la sesión al vencer', () => {
    vi.useFakeTimers();
    sessionStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({ ...response, expiraEn: Date.now() + 1000 }),
    );
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const auth = TestBed.inject(AuthService);
    vi.advanceTimersByTime(1001);
    expect(auth.sesion()).toBeNull();
    expect(navegar).toHaveBeenCalled();
  });
});
