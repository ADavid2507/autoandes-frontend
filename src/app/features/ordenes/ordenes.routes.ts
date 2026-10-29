import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
export const ORDENES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permisoGuard],
    data: { permiso: 'ORDEN_LEER' },
    loadComponent: () => import('./pages/orden-list/orden-list').then((m) => m.OrdenesLista),
  },
  {
    path: 'nueva',
    canActivate: [permisoGuard],
    data: { permiso: 'ORDEN_REGISTRAR' },
    loadComponent: () => import('./pages/orden-form/orden-form').then((m) => m.OrdenRegistro),
  },
  {
    path: ':id',
    canActivate: [permisoGuard],
    data: { permiso: 'ORDEN_LEER' },
    loadComponent: () => import('./pages/orden-detalle/orden-detalle').then((m) => m.OrdenDetalle),
  },
];
