import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './core/guards/auth-guard';
import { permisoGuard } from './core/guards/permiso-guard';
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'ordenes' },
      {
        path: 'servicios',
        canActivate: [permisoGuard],
        data: { permiso: 'SERVICIO_LEER' },
        loadChildren: () =>
          import('./features/servicios/servicios.routes').then((m) => m.SERVICIOS_ROUTES),
      },
      {
        path: 'vehiculos',
        canActivate: [permisoGuard],
        data: { permiso: 'VEHICULO_LEER' },
        loadChildren: () =>
          import('./features/vehiculos/vehiculos.routes').then((m) => m.VEHICULOS_ROUTES),
      },
      {
        path: 'ordenes',
        canActivate: [permisoGuard],
        data: { permiso: 'ORDEN_LEER' },
        loadChildren: () =>
          import('./features/ordenes/ordenes.routes').then((m) => m.ORDENES_ROUTES),
      },
      {
        path: 'reportes',
        canActivate: [permisoGuard],
        data: { permiso: 'REPORTE_VER' },
        loadChildren: () =>
          import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      {
        path: 'acceso-denegado',
        loadComponent: () =>
          import('./shared/pages/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
      },
    ],
  },
];
