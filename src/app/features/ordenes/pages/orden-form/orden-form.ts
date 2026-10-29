import { DestroyRef } from '@angular/core';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize, startWith } from 'rxjs';
import { OrdenesService } from '../../services/orden-service';
import { VehiculosService } from '../../../vehiculos/services/vehiculo-service';
import { ServiciosService } from '../../../servicios/services/servicio-service';
import { Vehiculo, Servicio, Orden } from '../../../../core/models/api';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { errorFormulario } from '../../../../core/utils/http-error';
export function detallesUnicos(control: AbstractControl): ValidationErrors | null {
  const ids = (control.value as { servicioId: number }[]).map((d) => d.servicioId).filter(Boolean);
  return new Set(ids).size === ids.length ? null : { repetidos: true };
}
@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: './orden-form.html',
  styleUrl: './orden-form.css',
})
export class OrdenRegistro {
  private readonly destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder).nonNullable;
  private api = inject(OrdenesService);
  private vehiculosApi = inject(VehiculosService);
  private serviciosApi = inject(ServiciosService);
  vehiculos = signal<Vehiculo[]>([]);
  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  registrada = signal<Orden | null>(null);
  disponible = signal(false);
  detalles = this.fb.array(
    [this.linea()],
    [Validators.required, Validators.minLength(1), Validators.maxLength(10), detallesUnicos],
  );
  form = this.fb.group({
    vehiculoId: [0, [Validators.required, Validators.min(1)]],
    kilometraje: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(9999999),
        Validators.pattern(/^\d+$/),
      ],
    ],
    detalles: this.detalles,
  });
  valores = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())));
  total = computed(() => {
    this.valores();
    return this.detalles.controls.reduce((s, _, i) => s + this.subtotal(i), 0);
  });
  constructor() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({ vehiculos: this.vehiculosApi.listar(), servicios: this.serviciosApi.listar() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.vehiculos.set(r.vehiculos);
          this.servicios.set(r.servicios.filter((s) => s.activo));
          this.disponible.set(r.vehiculos.length > 0 && r.servicios.some((s) => s.activo));
        },
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
  private linea() {
    return this.fb.group({
      servicioId: [0, [Validators.required, Validators.min(1)]],
      cantidad: [
        1,
        [Validators.required, Validators.min(1), Validators.max(5), Validators.pattern(/^[1-5]$/)],
      ],
    });
  }
  agregar() {
    if (this.detalles.length < 10 && !this.guardando()) this.detalles.push(this.linea());
  }
  quitar(i: number) {
    if (this.detalles.length > 1 && !this.guardando()) this.detalles.removeAt(i);
  }
  seleccionado(id: number, i: number) {
    this.valores();
    return this.detalles.controls.some((c, j) => j !== i && c.controls.servicioId.value === id);
  }
  subtotal(i: number) {
    this.valores();
    const d = this.detalles.at(i).getRawValue();
    return (this.servicios().find((s) => s.id === d.servicioId)?.precio ?? 0) * (d.cantidad || 0);
  }
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando() || !this.disponible()) return;
    this.error.set('');
    this.guardando.set(true);
    this.api
      .registrar(this.form.getRawValue())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (r) => this.registrada.set(r),
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
}
