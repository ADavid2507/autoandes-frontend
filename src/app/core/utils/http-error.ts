import { AbstractControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/error-response';
export function mensajeError(error: HttpErrorResponse): string {
  if (error.status === 0)
    return 'No se pudo conectar con AutoAndes API. Revisa que el backend esté iniciado.';
  const data = error.error as Partial<ApiError> | null;
  return data && typeof data.mensaje === 'string'
    ? data.mensaje
    : 'No se pudo completar la operación.';
}
export function erroresDeValidacion(error: HttpErrorResponse): Record<string, string> {
  const data = error.error as Partial<ApiError> | null;
  return data?.campos ?? {};
}
export function errorFormulario(form: AbstractControl, error: HttpErrorResponse): string {
  for (const [campo, mensaje] of Object.entries(erroresDeValidacion(error))) {
    const control = form.get(campo.replace(/\[(\d+)\]/g, '.$1'));
    control?.setErrors({ ...control.errors, servidor: mensaje });
    control?.markAsTouched();
  }
  return mensajeError(error);
}
