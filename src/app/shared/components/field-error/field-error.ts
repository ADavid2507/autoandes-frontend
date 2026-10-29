import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-field-error',
  styleUrl: './field-error.css',
  templateUrl: './field-error.html',
})
export class FieldError {
  control = input<AbstractControl | null>(null);
  mensaje(c: AbstractControl) {
    if (c.hasError('servidor')) return c.getError('servidor');
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('pattern')) return 'El formato no es válido.';
    if (c.hasError('minlength'))
      return 'Debe tener al menos ' + c.getError('minlength').requiredLength + ' caracteres.';
    if (c.hasError('maxlength'))
      return 'Supera el máximo de ' + c.getError('maxlength').requiredLength + ' caracteres.';
    if (c.hasError('min')) return 'El valor mínimo es ' + c.getError('min').min + '../../../shared';
    if (c.hasError('max')) return 'El valor máximo es ' + c.getError('max').max + '../../../shared';
    return 'Revisa este valor.';
  }
}
