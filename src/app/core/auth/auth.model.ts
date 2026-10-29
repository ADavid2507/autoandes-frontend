export type Permiso =
  | 'SERVICIO_LEER'
  | 'SERVICIO_ESCRIBIR'
  | 'VEHICULO_LEER'
  | 'VEHICULO_ESCRIBIR'
  | 'ORDEN_LEER'
  | 'ORDEN_REGISTRAR'
  | 'ORDEN_ANULAR'
  | 'REPORTE_VER';
export interface Perfil {
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
}
export interface LoginResponse extends Perfil {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
}
export interface Sesion extends LoginResponse {
  expiraEn: number;
}
