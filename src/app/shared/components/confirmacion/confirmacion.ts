import { Component, input, output, afterNextRender, viewChild, ElementRef } from '@angular/core';
@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
})
export class Confirmacion {
  titulo = input.required<string>();
  mensaje = input.required<string>();
  aceptar = output<void>();
  cancelar = output<void>();
  private cancelarBoton = viewChild<ElementRef<HTMLButtonElement>>('cancelarBoton');
  private aceptarBoton = viewChild<ElementRef<HTMLButtonElement>>('aceptarBoton');
  private anterior: Element | null = document.activeElement;
  constructor() {
    afterNextRender(() => this.cancelarBoton()?.nativeElement.focus());
  }
  cerrar() {
    this.restaurar();
    this.cancelar.emit();
  }
  confirmar() {
    this.restaurar();
    this.aceptar.emit();
  }
  moverFoco(event: Event) {
    if (!(event instanceof KeyboardEvent)) return;
    const primero = this.cancelarBoton()?.nativeElement,
      ultimo = this.aceptarBoton()?.nativeElement;
    if (event.shiftKey && document.activeElement === primero) {
      event.preventDefault();
      ultimo?.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primero?.focus();
    }
  }
  private restaurar() {
    if (this.anterior instanceof HTMLElement) this.anterior.focus();
  }
}
