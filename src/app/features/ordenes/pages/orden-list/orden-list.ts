import { Paginador } from '../../../../shared/components/paginador/paginador';
import { PaginaResponse, Direccion } from '../../../../core/models/pagina-response';
import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdenesService } from '../../services/orden-service';
import { Orden } from '../../../../core/models/api';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { mensajeError } from '../../../../core/utils/http-error';
@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, SiPermiso, Paginador],
  templateUrl: './orden-list.html',
  styleUrl: './orden-list.css',
})
export class OrdenesLista {
  private readonly destroyRef = inject(DestroyRef);
  private api = inject(OrdenesService);
  private destroy = inject(DestroyRef);
  private solicitud?: import('rxjs').Subscription;
  ordenes = signal<Orden[]>([]);
  cargando = signal(true);
  error = signal('');
  filtros = inject(FormBuilder).nonNullable.group({
    placa: [''],
    estado: [''],
    desde: [''],
    hasta: [''],
  });
  registradas = computed(() => this.ordenes().filter((o) => o.estado === 'REGISTRADA').length);
  anuladas = computed(() => this.ordenes().filter((o) => o.estado === 'ANULADA').length);
  total = computed(() =>
    this.ordenes()
      .filter((o) => o.estado === 'REGISTRADA')
      .reduce((s, o) => s + o.total, 0),
  );
  constructor() {
    this.cargar();
  }
  cargar() {
    const filtros = this.filtros.getRawValue();
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      this.error.set('Desde no puede ser posterior a hasta.');
      return;
    }
    this.solicitud?.unsubscribe();
    this.error.set('');
    this.cargando.set(true);
    this.solicitud = this.api
      .listarPaginado(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion(), filtros)
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => this.recibirPagina(r),
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  limpiar() {
    this.filtros.reset();
    this.aplicarFiltros();
  }

  pagina = signal(0);
  tamanio = signal(5);
  ordenarPor = signal('fecha');
  direccion = signal<Direccion>('desc');
  resultado = signal<PaginaResponse<Orden> | null>(null);
  private recibirPagina(r: PaginaResponse<Orden>) {
    if (r.totalPaginas > 0 && r.pagina >= r.totalPaginas) {
      this.pagina.set(r.totalPaginas - 1);
      this.cargar();
      return;
    }
    if (r.totalElementos === 0 && r.pagina > 0) {
      this.pagina.set(0);
      this.cargar();
      return;
    }
    this.resultado.set(r);
    this.pagina.set(r.pagina);
    this.ordenes.set(r.contenido);
  }
  irA(pagina: number) {
    if (this.cargando() || pagina < 0 || pagina >= (this.resultado()?.totalPaginas ?? 0)) return;
    this.pagina.set(pagina);
    this.cargar();
  }
  cambiarTamanio(tamanio: number) {
    if (this.cargando() || ![5, 10, 20, 100].includes(tamanio)) return;
    this.tamanio.set(tamanio);
    this.pagina.set(0);
    this.cargar();
  }
  cambiarOrden(campo: string) {
    if (this.cargando()) return;
    this.ordenarPor.set(campo);
    this.pagina.set(0);
    this.cargar();
  }
  cambiarDireccion(valor: Direccion) {
    if (this.cargando()) return;
    this.direccion.set(valor);
    this.pagina.set(0);
    this.cargar();
  }

  aplicarFiltros() {
    this.pagina.set(0);
    this.cargar();
  }
}
