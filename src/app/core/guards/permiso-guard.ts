import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { Permiso } from '../auth/auth.model';
export const permisoGuard: CanActivateFn = (route) =>
  inject(AuthService).tienePermiso(route.data['permiso'] as Permiso)
    ? true
    : inject(Router).createUrlTree(['/acceso-denegado']);
