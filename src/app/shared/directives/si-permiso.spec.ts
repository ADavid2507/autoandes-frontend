import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SiPermiso } from './si-permiso';
import { AuthService } from '../../core/auth/auth-service';
@Component({
  imports: [SiPermiso],
  template: `<button *siPermiso="'ORDEN_ANULAR'">Anular</button>`,
})
class Host {}
describe('SiPermiso', () => {
  it('monta y retira acciones cuando cambia el permiso', async () => {
    const permitido = signal(false);
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: AuthService, useValue: { tienePermiso: () => permitido() } }],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    permitido.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Anular');
    permitido.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
