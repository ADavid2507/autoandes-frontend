import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_LEER' },
    loadComponent: () =>
      import('./pages/vehiculo-list/vehiculo-list').then((m) => m.VehiculosLista),
  },
  {
    path: 'nuevo',
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' },
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form').then((m) => m.VehiculoFormulario),
  },
  {
    path: ':id/editar',
    canActivate: [permisoGuard],
    data: { permiso: 'VEHICULO_ESCRIBIR' },
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form').then((m) => m.VehiculoFormulario),
  },
];
