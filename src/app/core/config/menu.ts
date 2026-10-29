import { Permiso } from '../models/api';
export const MENU: ReadonlyArray<{
  ruta: string;
  texto: string;
  permiso: Permiso;
  numero: string;
}> = [
  { ruta: '/ordenes', texto: 'Órdenes de servicio', permiso: 'ORDEN_LEER', numero: '01' },
  { ruta: '/vehiculos', texto: 'Vehículos', permiso: 'VEHICULO_LEER', numero: '02' },
  { ruta: '/servicios', texto: 'Servicios', permiso: 'SERVICIO_LEER', numero: '03' },
  { ruta: '/reportes', texto: 'Reporte de ingresos', permiso: 'REPORTE_VER', numero: '04' },
];
