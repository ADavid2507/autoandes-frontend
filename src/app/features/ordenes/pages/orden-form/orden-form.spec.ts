import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { OrdenRegistro } from './orden-form';
describe('Registro de orden', () => {
  const servicios = [
    { id: 1, codigo: 'SRV-001', nombre: 'Aceite', precio: 90, duracionMin: 30, activo: true },
    { id: 8, codigo: 'SRV-008', nombre: 'Inactivo', precio: 70, duracionMin: 30, activo: false },
  ];
  const vehiculos = [
    {
      id: 1,
      placa: 'AAA-111',
      marca: 'Toyota',
      modelo: 'Yaris',
      anio: 2020,
      clienteId: 1,
      clienteNombre: 'Cliente',
    },
  ];
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OrdenRegistro],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function preparar() {
    const fixture = TestBed.createComponent(OrdenRegistro);
    const mock = TestBed.inject(HttpTestingController);
    mock.expectOne(environment.apiUrl + '/vehiculos').flush(vehiculos);
    mock.expectOne(environment.apiUrl + '/servicios').flush(servicios);
    return { fixture, mock, page: fixture.componentInstance };
  }
  it('calcula estimados sin enviar precios ni total y conserva líneas ante 409', () => {
    const { fixture, mock, page } = preparar();
    page.form.patchValue({ vehiculoId: 1, kilometraje: 45000 });
    page.detalles.at(0).setValue({ servicioId: 1, cantidad: 2 });
    fixture.detectChanges();
    expect(page.total()).toBe(180);
    expect(page.servicios().length).toBe(1);
    page.guardar();
    const req = mock.expectOne(environment.apiUrl + '/ordenes');
    expect(req.request.body).toEqual({
      vehiculoId: 1,
      kilometraje: 45000,
      detalles: [{ servicioId: 1, cantidad: 2 }],
    });
    page.guardar();
    mock.expectNone(environment.apiUrl + '/ordenes');
    req.flush(
      { mensaje: 'El último kilometraje es 50000' },
      { status: 409, statusText: 'Conflict' },
    );
    expect(page.detalles.length).toBe(1);
    expect(page.detalles.at(0).value.cantidad).toBe(2);
    expect(page.guardando()).toBe(false);
    expect(page.error()).toContain('50000');
  });
  it('no permite servicios repetidos, más de diez líneas ni cantidades fuera de rango', () => {
    const { page } = preparar();
    page.detalles.at(0).setValue({ servicioId: 1, cantidad: 1 });
    page.agregar();
    page.detalles.at(1).setValue({ servicioId: 1, cantidad: 6 });
    expect(page.detalles.hasError('repetidos')).toBe(true);
    expect(page.form.invalid).toBe(true);
    for (let i = 0; i < 20; i++) page.agregar();
    expect(page.detalles.length).toBe(10);
  });
  it('presenta falta de datos sin permitir guardar', () => {
    const fixture = TestBed.createComponent(OrdenRegistro);
    const mock = TestBed.inject(HttpTestingController);
    mock.expectOne(environment.apiUrl + '/vehiculos').flush([]);
    mock.expectOne(environment.apiUrl + '/servicios').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Faltan datos');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
