import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { OrdenesService } from '../../services/orden-service';
import { Orden } from '../../../../core/models/api';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { errorFormulario, mensajeError } from '../../../../core/utils/http-error';
@Component({
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SiPermiso, FieldError],
  templateUrl: './orden-detalle.html',
  styleUrl: './orden-detalle.css',
})
export class OrdenDetalle {
  private readonly destroyRef = inject(DestroyRef);
  private api = inject(OrdenesService);
  private route = inject(ActivatedRoute);
  orden = signal<Orden | null>(null);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  mostrarAnulacion = signal(false);
  form = inject(FormBuilder).nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
  });
  constructor() {
    this.cargar();
  }
  cargar() {
    const raw = this.route.snapshot.paramMap.get('id') ?? '';
    const id = Number(raw);
    if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(id)) {
      this.error.set('Identificador de orden inválido.');
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.api
      .leer(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({ next: (r) => this.orden.set(r), error: (e) => this.error.set(mensajeError(e)) });
  }
  anular() {
    this.form.controls.motivo.setValue(this.form.controls.motivo.value.trim());
    this.form.markAllAsTouched();
    const orden = this.orden();
    if (!orden || this.form.invalid || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    this.api
      .anular(orden.id, this.form.getRawValue().motivo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.orden.set(r);
          this.mostrarAnulacion.set(false);
        },
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
  imprimir() {
    window.print();
  }
}
