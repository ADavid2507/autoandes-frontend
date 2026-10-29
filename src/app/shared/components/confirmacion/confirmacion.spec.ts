import { TestBed } from '@angular/core/testing';
import { Confirmacion } from './confirmacion';
describe('Confirmación de operación', () => {
  it('solicita una decisión explícita y permite cancelar', async () => {
    const fixture = TestBed.createComponent(Confirmacion);
    fixture.componentRef.setInput('titulo', 'Dar de baja servicio');
    fixture.componentRef.setInput('mensaje', 'Se desactivará el servicio.');
    const aceptar = vi.fn(),
      cancelar = vi.fn();
    fixture.componentInstance.aceptar.subscribe(aceptar);
    fixture.componentInstance.cancelar.subscribe(cancelar);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alertdialog]')).not.toBeNull();
    expect(aceptar).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('button').click();
    expect(cancelar).toHaveBeenCalledOnce();
    expect(aceptar).not.toHaveBeenCalled();
  });
});
