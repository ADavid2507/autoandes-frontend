import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccesoDenegado } from './acceso-denegado';
describe('AccesoDenegado', () => {
  it('explica el resultado y ofrece volver', () => {
    TestBed.configureTestingModule({ imports: [AccesoDenegado], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(AccesoDenegado);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Acceso denegado');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/ordenes');
  });
});
