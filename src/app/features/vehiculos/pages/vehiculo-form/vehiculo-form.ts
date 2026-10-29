import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { VehiculosService } from '../../services/vehiculo-service';
import { ClientesService } from '../../../clientes/services/cliente-service';
import { Cliente } from '../../../clientes/models/cliente.model';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { errorFormulario } from '../../../../core/utils/http-error';
@Component({
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: './vehiculo-form.html',
  styleUrl: './vehiculo-form.css',
})
export class VehiculoFormulario {
  private readonly destroyRef = inject(DestroyRef);
  private api = inject(VehiculosService);
  private clientesApi = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rawId = this.route.snapshot.paramMap.get('id');
  id = this.rawId === null ? null : Number(this.rawId);
  cargando = signal(true);
  guardando = signal(false);
  listo = signal(false);
  error = signal('');
  clientes = signal<Cliente[]>([]);
  form = inject(FormBuilder).nonNullable.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-[0-9]{3}$/)]],
    marca: ['', [Validators.required, Validators.maxLength(40)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    anio: [
      2026,
      [
        Validators.required,
        Validators.min(1990),
        Validators.max(2027),
        Validators.pattern(/^\d+$/),
      ],
    ],
    clienteId: [0, [Validators.required, Validators.min(1)]],
  });
  constructor() {
    if (this.rawId !== null && (!/^[1-9]\d*$/.test(this.rawId) || !Number.isSafeInteger(this.id))) {
      this.error.set('Identificador inválido.');
      this.cargando.set(false);
      return;
    }
    forkJoin({
      clientes: this.clientesApi.listar(),
      vehiculo: this.id ? this.api.leer(this.id) : of(null),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.clientes.set(r.clientes);
          if (r.vehiculo) this.form.patchValue(r.vehiculo);
          this.listo.set(r.clientes.length > 0);
          if (!r.clientes.length)
            this.error.set('No hay clientes disponibles para registrar un vehículo.');
        },
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
  guardar() {
    const value = this.form.getRawValue();
    this.form.patchValue({
      placa: value.placa.trim().toUpperCase(),
      marca: value.marca.trim(),
      modelo: value.modelo.trim(),
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
        next: () => void this.router.navigate(['/vehiculos']),
        error: (e) => this.error.set(errorFormulario(this.form, e)),
      });
  }
}
