import { Component, input, output } from '@angular/core';
@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  pagina = input(0);
  tamanio = input(5);
  totalElementos = input(0);
  totalPaginas = input(0);
  ocupado = input(false);
  paginaCambiada = output<number>();
  tamanioCambiado = output<number>();
  readonly tamanios = [5, 10, 20, 100];
  cambiarTamanio(event: Event) {
    const valor = Number((event.target as HTMLSelectElement).value);
    if (!this.ocupado() && this.tamanios.includes(valor)) this.tamanioCambiado.emit(valor);
  }
  irA(pagina: number) {
    if (!this.ocupado() && pagina >= 0 && pagina < this.totalPaginas())
      this.paginaCambiada.emit(pagina);
  }
}
