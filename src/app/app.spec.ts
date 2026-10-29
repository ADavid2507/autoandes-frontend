import { TestBed } from '@angular/core/testing';
import { App } from './app';
describe('App', () => {
  it('expone el punto de navegación sin datos simulados', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
