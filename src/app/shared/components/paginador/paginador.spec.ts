import { TestBed } from '@angular/core/testing';
import { Paginador } from './paginador';
describe('Paginador', () => {
  it('muestra total real y deshabilita las fronteras', () => {
    const fixture = TestBed.createComponent(Paginador);
    fixture.componentRef.setInput('totalElementos', 12);
    fixture.componentRef.setInput('totalPaginas', 3);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Página 1 de 3');
    expect(fixture.nativeElement.textContent).toContain('12 registros');
    expect(fixture.nativeElement.querySelector('[aria-label="Página anterior"]').disabled).toBe(
      true,
    );
    expect(fixture.nativeElement.querySelector('[aria-label="Página siguiente"]').disabled).toBe(
      false,
    );
    fixture.componentRef.setInput('pagina', 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Página siguiente"]').disabled).toBe(
      true,
    );
  });
  it('no navega fuera de rango ni durante la carga', () => {
    const fixture = TestBed.createComponent(Paginador);
    fixture.componentRef.setInput('totalPaginas', 3);
    const cambiar = vi.fn();
    fixture.componentInstance.paginaCambiada.subscribe(cambiar);
    fixture.componentInstance.irA(-1);
    fixture.componentInstance.irA(3);
    expect(cambiar).not.toHaveBeenCalled();
    fixture.componentInstance.irA(1);
    expect(cambiar).toHaveBeenCalledWith(1);
    fixture.componentRef.setInput('ocupado', true);
    fixture.componentInstance.irA(2);
    expect(cambiar).toHaveBeenCalledTimes(1);
  });
});
