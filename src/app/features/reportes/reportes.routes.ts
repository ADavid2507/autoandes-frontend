import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
export const REPORTES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permisoGuard],
    data: { permiso: 'REPORTE_VER' },
    loadComponent: () =>
      import('./pages/ingresos-servicio/ingresos-servicio').then((m) => m.ReporteIngresos),
  },
];
