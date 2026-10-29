import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
const paginar = (contenido: unknown[] = [], pagina = 0, totalElementos = 0, tamanio = 5) => ({
  contenido,
  pagina,
  tamanio,
  totalElementos,
  totalPaginas: Math.ceil(totalElementos / tamanio),
  ultima: (pagina + 1) * tamanio >= totalElementos,
});
import { ServiciosLista } from './servicio-list';
describe('ServiciosLista con paginación', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ServiciosLista],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { tienePermiso: () => true } },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  const url = environment.apiUrl + '/servicios/paginado';
  it('muestra carga y vacío con metadatos del servidor', () => {
    const fixture = TestBed.createComponent(ServiciosLista);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando');
    const mock = TestBed.inject(HttpTestingController);
    const req = mock.expectOne((r) => r.url === url);
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('tamanio')).toBe('5');
    req.flush(paginar());
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin resultados');
    expect(fixture.nativeElement.textContent).toContain('Página 0 de 0');
  });
  it('muestra errores y libera la lista para reintentar', () => {
    const fixture = TestBed.createComponent(ServiciosLista);
    const page = fixture.componentInstance,
      mock = TestBed.inject(HttpTestingController);
    mock
      .expectOne((r) => r.url === url)
      .flush({ mensaje: 'No disponible' }, { status: 500, statusText: 'Error' });
    expect(page.error()).toBe('No disponible');
    expect(page.cargando()).toBe(false);
    page.cargar();
    mock.expectOne((r) => r.url === url).flush(paginar());
    expect(page.error()).toBe('');
  });
  it('navega y reinicia página al cambiar filtros, tamaño y orden', () => {
    const page = TestBed.createComponent(ServiciosLista).componentInstance,
      mock = TestBed.inject(HttpTestingController);
    mock.expectOne((r) => r.url === url).flush(paginar([], 0, 12));
    page.irA(1);
    const segunda = mock.expectOne((r) => r.url === url);
    expect(segunda.request.params.get('pagina')).toBe('1');
    segunda.flush(paginar([], 1, 12));
    page.buscar('Cambio');
    const busqueda = mock.expectOne((r) => r.url === url);
    expect(busqueda.request.params.get('pagina')).toBe('0');
    expect(busqueda.request.params.get('buscar')).toBe('Cambio');
    busqueda.flush(paginar([], 0, 2));
    page.cambiarTamanio(10);
    const size = mock.expectOne((r) => r.url === url);
    expect(size.request.params.get('tamanio')).toBe('10');
    size.flush(paginar([], 0, 2, 10));
    page.cambiarOrden('id');
    const orden = mock.expectOne((r) => r.url === url);
    expect(orden.request.params.get('ordenarPor')).toBe('id');
    orden.flush(paginar([], 0, 2, 10));
  });
  it('retrocede cuando se elimina el último registro de una página', () => {
    const page = TestBed.createComponent(ServiciosLista).componentInstance,
      mock = TestBed.inject(HttpTestingController);
    mock.expectOne((r) => r.url === url).flush(paginar([], 0, 6));
    page.irA(1);
    mock.expectOne((r) => r.url === url).flush(paginar([], 1, 5));
    const corregida = mock.expectOne((r) => r.url === url);
    expect(corregida.request.params.get('pagina')).toBe('0');
    corregida.flush(paginar([], 0, 5));
    expect(page.pagina()).toBe(0);
  });
});
