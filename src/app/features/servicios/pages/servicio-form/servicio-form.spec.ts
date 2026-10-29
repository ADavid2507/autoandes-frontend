import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { ServicioFormulario } from './servicio-form';
describe('ServicioFormulario', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ServicioFormulario],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('rechaza el formulario vacío sin enviar POST', () => {
    const fixture = TestBed.createComponent(ServicioFormulario);
    const mock = TestBed.inject(HttpTestingController);
    fixture.componentInstance.guardar();
    mock.expectNone(environment.apiUrl + '/servicios');
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
  it('conserva valores ante 409 y muestra campos del 400', () => {
    const fixture = TestBed.createComponent(ServicioFormulario);
    const mock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({
      codigo: 'SRV-009',
      nombre: 'Servicio prueba',
      precio: 90,
      duracionMin: 30,
      activo: true,
    });
    page.guardar();
    const req = mock.expectOne(environment.apiUrl + '/servicios');
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Registro duplicado' }, { status: 409, statusText: 'Conflict' });
    expect(page.error()).toBe('Registro duplicado');
    expect(page.guardando()).toBe(false);
    expect(page.form.getRawValue()).toEqual({
      codigo: 'SRV-009',
      nombre: 'Servicio prueba',
      precio: 90,
      duracionMin: 30,
      activo: true,
    });
    page.guardar();
    mock
      .expectOne(environment.apiUrl + '/servicios')
      .flush(
        { mensaje: 'Datos inválidos', campos: { nombre: 'Revisa este campo' } },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Revisa este campo');
  });
  it('rechaza ids de edición inválidos sin consultar ni permitir alta', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap({ id: 'abc' }) } },
    });
    const page = TestBed.createComponent(ServicioFormulario).componentInstance;
    expect(page.listo()).toBe(false);
    expect(page.error()).toContain('Identificador');
  });
});
