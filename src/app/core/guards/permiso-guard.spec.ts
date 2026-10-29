import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { permisoGuard } from './permiso-guard';
import { authGuard, invitadoGuard } from './auth-guard';
describe('Guards de navegación', () => {
  const auth = { token: vi.fn(), tienePermiso: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });
  it('redirige al login conservando returnUrl', () => {
    auth.token.mockReturnValue(null);
    const route = { data: {} } as ActivatedRouteSnapshot;
    const state = { url: '/ordenes/nueva' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(
      TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree),
    ).toContain('returnUrl=%2Fordenes%2Fnueva');
  });
  it('rechaza una ruta manual sin permiso', () => {
    auth.tienePermiso.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      permisoGuard(
        { data: { permiso: 'ORDEN_REGISTRAR' } } as unknown as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
    expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe(
      '/acceso-denegado',
    );
  });
  it('permite la ruta con permiso', () => {
    auth.tienePermiso.mockReturnValue(true);
    expect(
      TestBed.runInInjectionContext(() =>
        permisoGuard(
          { data: { permiso: 'ORDEN_REGISTRAR' } } as unknown as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ),
      ),
    ).toBe(true);
  });
});
