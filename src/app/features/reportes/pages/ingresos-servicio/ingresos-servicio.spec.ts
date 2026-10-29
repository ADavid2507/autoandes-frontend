import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { ReporteIngresos } from './ingresos-servicio';
describe('Reporte de ingresos', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ReporteIngresos],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('consulta el periodo y muestra un estado vacío', () => {
    const fixture = TestBed.createComponent(ReporteIngresos);
    fixture.componentInstance.form.setValue({ desde: '2026-10-01', hasta: '2026-10-29' });
    fixture.componentInstance.cargar();
    const req = TestBed.inject(HttpTestingController).expectOne(
      (r) => r.url === environment.apiUrl + '/reportes/ingresos-por-servicio',
    );
    expect(req.request.params.get('hasta')).toBe('2026-10-29');
    req.flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay ingresos');
  });
  it('rechaza un periodo invertido', () => {
    const page = TestBed.createComponent(ReporteIngresos).componentInstance;
    page.form.setValue({ desde: '2026-10-29', hasta: '2026-10-01' });
    page.cargar();
    expect(page.error()).toContain('posterior');
  });
});
