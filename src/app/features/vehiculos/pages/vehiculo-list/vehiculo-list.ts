import { Paginador } from '../../../../shared/components/paginador/paginador';
import { PaginaResponse, Direccion } from '../../../../core/models/pagina-response';
import { Confirmacion } from '../../../../shared/components/confirmacion/confirmacion';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { VehiculosService } from '../../services/vehiculo-service';
import { Vehiculo } from '../../../../core/models/api';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { mensajeError } from '../../../../core/utils/http-error';
import { ClientesService } from '../../../clientes/services/cliente-service';
import { Cliente } from '../../../../core/models/api';
@Component({
  imports: [CommonModule, FormsModule, RouterLink, SiPermiso, Confirmacion, Paginador],
  styleUrl: './vehiculo-list.css',
  templateUrl: './vehiculo-list.html',
})
export class VehiculosLista {
  private readonly destroyRef = inject(DestroyRef);
  private solicitud?: Subscription;
  private api = inject(VehiculosService);
  items = signal<Vehiculo[]>([]);
  cargando = signal(true);
  error = signal('');
  busqueda = signal('');
  pendiente = signal<number | null>(null);
  private clientesApi = inject(ClientesService);
  clientes = signal<Cliente[]>([]);
  clienteId = signal(0);
  filtrados = this.items.asReadonly();
  constructor() {
    this.cargar();
    this.clientesApi
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => this.clientes.set(r),
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  cargar() {
    this.solicitud?.unsubscribe();
    this.error.set('');
    this.cargando.set(true);
    this.solicitud = this.api
      .listarPaginado(
        this.pagina(),
        this.tamanio(),
        this.ordenarPor(),
        this.direccion(),
        this.busqueda(),
        this.clienteId() || undefined,
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => this.recibirPagina(r),
        error: (e) => this.error.set(mensajeError(e)),
      });
  }
  private ejecutarEliminar(item: Vehiculo) {
    this.pendiente.set(item.id);
    this.error.set('');
    this.api
      .eliminar(item.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pendiente.set(null)),
      )
      .subscribe({ next: () => this.cargar(), error: (e) => this.error.set(mensajeError(e)) });
  }

  confirmacion = signal<{
    item: Vehiculo;
    tipo: 'eliminar' | 'estado';
    titulo: string;
    mensaje: string;
  } | null>(null);
  eliminar(item: Vehiculo) {
    if (this.pendiente() !== null) return;
    this.confirmacion.set({
      item,
      tipo: 'eliminar',
      titulo: 'Eliminar vehiculo',
      mensaje:
        'Se eliminará el registro seleccionado. El backend rechazará la operación si tiene órdenes asociadas.',
    });
  }
  confirmar() {
    const accion = this.confirmacion();
    if (!accion || this.pendiente() !== null) return;
    this.confirmacion.set(null);
    this.ejecutarEliminar(accion.item);
  }

  pagina = signal(0);
  tamanio = signal(5);
  ordenarPor = signal('placa');
  direccion = signal<Direccion>('asc');
  resultado = signal<PaginaResponse<Vehiculo> | null>(null);
  private recibirPagina(r: PaginaResponse<Vehiculo>) {
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
    this.items.set(r.contenido);
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

  buscar(valor: string) {
    this.busqueda.set(valor);
    this.pagina.set(0);
    this.cargar();
  }
  filtrarCliente(id: number) {
    this.clienteId.set(id);
    this.pagina.set(0);
    this.cargar();
  }
}
