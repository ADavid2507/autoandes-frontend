import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ReportesService } from '../../services/reporte-service';
import { Ingreso } from '../../../../core/models/api';
import { errorFormulario } from '../../../../core/utils/http-error';
@Component({
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingresos-servicio.html',
  styleUrl: './ingresos-servicio.css',
})
export class ReporteIngresos {
  private readonly destroyRef = inject(DestroyRef);
  private api = inject(ReportesService);
  filas = signal<Ingreso[]>([]);
  cargando = signal(false);
  error = signal('');
  consultado = signal(false);
  periodo = signal('');
  private hoy = new Date();
  private fecha = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  form = inject(FormBuilder).nonNullable.group({
    desde: [
      this.fecha(new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1)),
      Validators.required,
    ],
    hasta: [this.fecha(this.hoy), Validators.required],
  });
  total = computed(() => this.filas().reduce((s, f) => s + f.importeTotal, 0));
  unidades = computed(() => this.filas().reduce((s, f) => s + f.cantidadTotal, 0));
  maximo = computed(() => Math.max(...this.filas().map((f) => f.importeTotal), 1));
  cargar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.cargando()) return;
    const { desde, hasta } = this.form.getRawValue();
    if (desde > hasta) {
      this.error.set('Desde no puede ser posterior a hasta.');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.api
      .ingresos(desde, hasta)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.filas.set(r);
          this.periodo.set(`${desde} — ${hasta}`);
          this.consultado.set(true);
        },
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
  imprimir() {
    window.print();
  }
}
