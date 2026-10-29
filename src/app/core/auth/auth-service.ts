import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Perfil, Permiso, Sesion } from './auth.model';

export const CLAVE_SESION = 'autoandes.sesion';
@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly actual = signal<Sesion | null>(this.restaurar());
  private temporizador?: ReturnType<typeof setTimeout>;
  private intervalo?: ReturnType<typeof setInterval>;
  private readonly avisoOculto = signal(false);
  readonly sesion = this.actual.asReadonly();
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly segundosRestantes = signal(0);
  readonly porVencer = computed(() => this.autenticado() && this.segundosRestantes() <= 120);
  readonly avisoSesionOculto = this.avisoOculto.asReadonly();

  constructor() {
    this.programar();
  }
  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(environment.apiUrl + '/auth/login', { username, password })
      .pipe(
        tap((response) => {
          const sesion: Sesion = {
            ...response,
            expiraEn: Date.now() + response.expiraEnSegundos * 1000,
          };
          this.actual.set(sesion);
          sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
          this.avisoOculto.set(false);
          this.programar();
        }),
      );
  }
  obtenerPerfil() {
    return this.http.get<Perfil>(environment.apiUrl + '/auth/me').pipe(
      tap((perfil) => {
        const sesion = this.sesion();
        if (!sesion) return;
        const actualizada = { ...sesion, ...perfil };
        this.actual.set(actualizada);
        sessionStorage.setItem(CLAVE_SESION, JSON.stringify(actualizada));
      }),
    );
  }
  token() {
    const s = this.sesion();
    return s && s.expiraEn > Date.now() ? s.token : null;
  }
  tienePermiso(permiso: Permiso) {
    return this.token() !== null && (this.sesion()?.permisos.includes(permiso) ?? false);
  }
  cerrarSesion(returnUrl?: string) {
    this.limpiar();
    this.actual.set(null);
    this.segundosRestantes.set(0);
    this.avisoOculto.set(false);
    sessionStorage.removeItem(CLAVE_SESION);
    void this.router.navigate(['/login'], {
      queryParams: returnUrl && returnUrl !== '/login' ? { returnUrl } : {},
    });
  }
  ocultarAvisoSesion() {
    this.avisoOculto.set(true);
  }
  ngOnDestroy() {
    this.limpiar();
  }
  private limpiar() {
    clearTimeout(this.temporizador);
    clearInterval(this.intervalo);
  }
  private programar() {
    this.limpiar();
    const sesion = this.sesion();
    if (!sesion) return;
    const actualizar = () =>
      this.segundosRestantes.set(Math.max(0, Math.ceil((sesion.expiraEn - Date.now()) / 1000)));
    actualizar();
    this.intervalo = setInterval(actualizar, 1000);
    this.temporizador = setTimeout(
      () => this.cerrarSesion(this.router.url),
      Math.max(0, Math.min(sesion.expiraEn - Date.now(), 2147483647)),
    );
  }
  private restaurar(): Sesion | null {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null');
      if (value && typeof value === 'object') {
        const s = value as Partial<Sesion>;
        if (
          typeof s.token === 'string' &&
          s.token.length > 0 &&
          typeof s.username === 'string' &&
          typeof s.nombreCompleto === 'string' &&
          typeof s.expiraEn === 'number' &&
          Number.isFinite(s.expiraEn) &&
          s.expiraEn > Date.now() &&
          Array.isArray(s.roles) &&
          s.roles.every((r) => typeof r === 'string') &&
          Array.isArray(s.permisos) &&
          s.permisos.every((p) => typeof p === 'string')
        )
          return s as Sesion;
      }
    } catch {
      /* Invalid storage is discarded; it never establishes a session. */
    }
    sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}
