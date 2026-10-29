import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ServiciosService } from '../../services/servicio-service';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { errorFormulario } from '../../../../core/utils/http-error';

@Component({
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  styleUrl: './servicio-form.css',
  templateUrl: './servicio-form.html',
})
export class ServicioFormulario {
  private readonly destroyRef = inject(DestroyRef);
  private api = inject(ServiciosService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rawId = this.route.snapshot.paramMap.get('id');
  id = this.rawId === null ? null : Number(this.rawId);
  cargando = signal(!!this.id);
  guardando = signal(false);
  listo = signal(!this.id);
  error = signal('');
  form = inject(FormBuilder).nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^SRV-[0-9]{3}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    precio: [1, [Validators.required, Validators.min(0.01)]],
    duracionMin: [
      30,
      [Validators.required, Validators.min(15), Validators.max(480), Validators.pattern(/^\d+$/)],
    ],
    activo: [true, Validators.required],
  });

  constructor() {
    if (this.rawId !== null && (!/^[1-9]\d*$/.test(this.rawId) || !Number.isSafeInteger(this.id))) {
      this.error.set('Identificador inválido.');
      this.listo.set(false);
      this.cargando.set(false);
      return;
    }

    if (this.id)
      this.api
        .leer(this.id)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.cargando.set(false)),
        )
        .subscribe({
          next: (r) => {
            this.form.patchValue(r);
            this.listo.set(true);
          },
          error: (e) => this.error.set(errorFormulario(this.form, e)),
        });
  }
  guardar() {
    const valor = this.form.getRawValue();
    this.form.patchValue({
      codigo: valor.codigo.trim().toUpperCase(),
      nombre: valor.nombre.trim(),
    });
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando() || !this.listo()) return;
    this.guardando.set(true);
    this.error.set('');
    const request = this.id
      ? this.api.actualizar(this.id, this.form.getRawValue())
      : this.api.crear(this.form.getRawValue());
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigate(['/servicios']),
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
}
