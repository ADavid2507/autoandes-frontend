import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { VehiculoFormulario } from './vehiculo-form';
describe('VehiculoFormulario', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [VehiculoFormulario],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('rechaza el formulario vacío sin enviar POST', () => {
    const fixture = TestBed.createComponent(VehiculoFormulario);
    const mock = TestBed.inject(HttpTestingController);
    mock
      .expectOne(environment.apiUrl + '/clientes')
      .flush([{ id: 1, documento: '12345678', nombres: 'Cliente', telefono: null }]);
    fixture.componentInstance.guardar();
    mock.expectNone(environment.apiUrl + '/vehiculos');
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });
  it('conserva valores ante 409 y muestra campos del 400', () => {
    const fixture = TestBed.createComponent(VehiculoFormulario);
    const mock = TestBed.inject(HttpTestingController);
    mock
      .expectOne(environment.apiUrl + '/clientes')
      .flush([{ id: 1, documento: '12345678', nombres: 'Cliente', telefono: null }]);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: 2020,
      clienteId: 1,
    });
    page.guardar();
    const req = mock.expectOne(environment.apiUrl + '/vehiculos');
    expect(req.request.method).toBe('POST');
    req.flush({ mensaje: 'Registro duplicado' }, { status: 409, statusText: 'Conflict' });
    expect(page.error()).toBe('Registro duplicado');
    expect(page.guardando()).toBe(false);
    expect(page.form.getRawValue()).toEqual({
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: 2020,
      clienteId: 1,
    });
    page.guardar();
    mock
      .expectOne(environment.apiUrl + '/vehiculos')
      .flush(
        { mensaje: 'Datos inválidos', campos: { placa: 'Revisa este campo' } },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Revisa este campo');
  });
  it('rechaza ids de edición inválidos sin consultar ni permitir alta', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { snapshot: { paramMap: convertToParamMap({ id: 'abc' }) } },
    });
    const page = TestBed.createComponent(VehiculoFormulario).componentInstance;
    expect(page.listo()).toBe(false);
    expect(page.error()).toContain('Identificador');
  });
});
