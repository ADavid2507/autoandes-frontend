import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { errorFormulario, mensajeError } from './http-error';
describe('Errores del contrato AutoAndes', () => {
  it('muestra mensaje del backend y asigna campos anidados', () => {
    const fb = new FormBuilder();
    const form = fb.group({ placa: [''], detalles: fb.array([fb.group({ cantidad: [1] })]) });
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        mensaje: 'Datos inválidos',
        campos: { placa: 'Formato ABC-123', 'detalles[0].cantidad': 'Máximo 5' },
      },
    });
    expect(errorFormulario(form, error)).toBe('Datos inválidos');
    expect(form.get('placa')?.getError('servidor')).toBe('Formato ABC-123');
    expect(form.get('detalles.0.cantidad')?.getError('servidor')).toBe('Máximo 5');
  });
  it('distingue los errores de conexión', () =>
    expect(mensajeError(new HttpErrorResponse({ status: 0 }))).toContain('No se pudo conectar'));
});
