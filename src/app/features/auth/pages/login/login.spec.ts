import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Login } from './login';
import { environment } from '../../../../../environments/environment';
describe('Login', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('no envía credenciales vacías', () => {
    const page = TestBed.createComponent(Login).componentInstance;
    page.enviar();
    expect(page.form.invalid).toBe(true);
    TestBed.inject(HttpTestingController).expectNone(environment.apiUrl + '/auth/login');
  });
  it('muestra el mensaje 401 y vuelve a habilitar el botón', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.form.setValue({ username: 'asesor', password: 'incorrecta' });
    page.enviar();
    expect(page.cargando()).toBe(true);
    TestBed.inject(HttpTestingController)
      .expectOne(environment.apiUrl + '/auth/login')
      .flush({ mensaje: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Credenciales inválidas');
    expect(page.cargando()).toBe(false);
  });
});
