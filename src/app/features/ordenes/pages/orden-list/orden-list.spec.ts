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
import { OrdenesLista } from './orden-list';
describe('Órdenes paginadas', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [OrdenesLista],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { tienePermiso: () => true } },
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  const url = environment.apiUrl + '/ordenes/paginado';
  it('envía filtros combinados junto a página, tamaño y orden', () => {
    const page = TestBed.createComponent(OrdenesLista).componentInstance,
      mock = TestBed.inject(HttpTestingController);
    mock.expectOne((r) => r.url === url).flush(paginar([], 0, 12));
    page.irA(1);
    const segunda = mock.expectOne((r) => r.url === url);
    expect(segunda.request.params.get('pagina')).toBe('1');
    segunda.flush(paginar([], 1, 12));
    page.filtros.setValue({
      placa: 'AAA-111',
      estado: 'REGISTRADA',
      desde: '2026-10-01',
      hasta: '2026-10-29',
    });
    page.aplicarFiltros();
    const req = mock.expectOne((r) => r.url === url);
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('placa')).toBe('AAA-111');
    expect(req.request.params.get('estado')).toBe('REGISTRADA');
    expect(req.request.params.get('desde')).toBe('2026-10-01');
    expect(req.request.params.get('ordenarPor')).toBe('fecha');
    expect(req.request.params.get('direccion')).toBe('desc');
    req.flush(paginar([], 0, 1));
  });
  it('rechaza fechas invertidas sin pedir una página', () => {
    const page = TestBed.createComponent(OrdenesLista).componentInstance,
      mock = TestBed.inject(HttpTestingController);
    mock.expectOne((r) => r.url === url).flush(paginar());
    page.filtros.patchValue({ desde: '2026-10-29', hasta: '2026-10-01' });
    page.aplicarFiltros();
    expect(page.error()).toContain('posterior');
    mock.expectNone((r) => r.url === url);
  });
});
