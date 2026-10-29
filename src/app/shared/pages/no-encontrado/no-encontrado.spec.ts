import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoEncontrado } from './no-encontrado';
describe('NoEncontrado', () => {
  it('explica el resultado y ofrece volver', () => {
    TestBed.configureTestingModule({ imports: [NoEncontrado], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NoEncontrado);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Página no encontrada');
    expect(fixture.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/ordenes');
  });
});
