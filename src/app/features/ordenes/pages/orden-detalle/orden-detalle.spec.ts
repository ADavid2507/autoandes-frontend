import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { OrdenDetalle } from './orden-detalle';
describe('Detalle y anulación', () => {
  const orden = {
    id: 1,
    numero: 'OS-000001',
    fecha: '2026-10-29T10:00:00',
    vehiculoId: 1,
    placa: 'AAA-111',
    clienteNombre: 'Cliente',
    kilometraje: 45000,
    estado: 'REGISTRADA',
    total: 90,
    usuarioRegistro: 'asesor',
    motivoAnulacion: null,
    detalles: [],
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OrdenDetalle],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        { provide: AuthService, useValue: { tienePermiso: () => true } },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('valida motivo y muestra el rechazo del backend sin perder la orden', () => {
    const page = TestBed.createComponent(OrdenDetalle).componentInstance;
    const mock = TestBed.inject(HttpTestingController);
    mock.expectOne(environment.apiUrl + '/ordenes/1').flush(orden);
    page.form.setValue({ motivo: 'corto' });
    page.anular();
    mock.expectNone(environment.apiUrl + '/ordenes/1/anular');
    page.form.setValue({ motivo: 'Solicitud de anulación' });
    page.anular();
    const req = mock.expectOne(environment.apiUrl + '/ordenes/1/anular');
    expect(req.request.method).toBe('PATCH');
    req.flush({ mensaje: 'Solo se anula el mismo día' }, { status: 409, statusText: 'Conflict' });
    expect(page.error()).toContain('mismo día');
    expect(page.orden()?.numero).toBe('OS-000001');
    expect(page.guardando()).toBe(false);
  });
});
