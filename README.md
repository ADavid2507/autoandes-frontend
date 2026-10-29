# AutoAndes Web

SPA Angular 22.2 para el caso AutoAndes del Examen Parcial II, versión A. Sigue la organización del proyecto de clases `pharma-frontend`, con el dominio, DTO y permisos del backend AutoAndes.

## Ejecutar

Requisitos: Node.js y npm compatibles con Angular 22; backend Oracle disponible en `http://localhost:8080`.

```powershell
npm.cmd ci
ng.cmd serve
```

Abre http://localhost:4200. `npm.cmd start` también ejecuta el servidor Angular.
En PowerShell usa `ng.cmd`/`npm.cmd` si está bloqueada la ejecución de archivos `.ps1`.

La URL de API está en `src/environments/environment.ts` y `environment.development.ts`:
`http://localhost:8080/api/v1`. Ningún componente contiene la URL de conexión ni claves de firma JWT.
El backend debe permitir CORS desde `http://localhost:4200`.

## Usuarios de prueba del examen

| Usuario  | Contraseña | Permisos                                                                                 |
| -------- | ---------- | ---------------------------------------------------------------------------------------- |
| admin    | Auto2026*  | Todos                                                                                    |
| asesor   | Auto2026*  | Consulta servicios, clientes, vehículos y órdenes; mantiene vehículos y registra órdenes |
| jefe     | Auto2026*  | Mantiene servicios, consulta y anula órdenes, ve reportes                                |
| inactivo | Auto2026*  | Login rechazado por el backend                                                           |

Los usuarios provienen de la semilla del backend, no de listas simuladas en Angular.

## Estructura

```text
src/app/
  core/auth/               Sesión con signals, sessionStorage y vencimiento
  core/guards/             authGuard, invitadoGuard y permisoGuard
  core/interceptors/       Bearer exclusivo de la API y tratamiento de 401
  core/config/             Menú según permisos
  core/utils/              Mensajes y errores por campo
  layout/                  Header, sidebar y main-layout
  shared/                  Directiva de permisos, campos, aviso de sesión, 403 y 404
  features/
    auth/pages/login/
    clientes/{models,services}/
    servicios/{models,services,pages}/
    vehiculos/{models,services,pages}/
    ordenes/{models,services,pages}/
    reportes/{models,services,pages}/
```

Cada recurso tiene rutas con carga diferida y sus propios modelos y adaptadores HTTP. Las páginas usan archivos TS/HTML/CSS y pruebas colocadas junto al código. `core/models/api.ts` reexporta tipos para las pantallas que necesitan catálogos de varios recursos; las definiciones viven en el recurso propietario.

## Las tres partes del frontend

1. **Parte 1 — P4:** layout, navegación diferida, página 404, CRUD de Servicios y Vehículos con formularios reactivos únicos para crear/editar, clientes desde la API, buscador/filtro y estados de carga/error/vacío.
2. **Parte 2 — P5 funcional:** registro cabecera-detalle con FormArray, 1–10 líneas, cantidades 1–5 y servicios sin repetir; cálculo estimado; éxito con número de orden; consulta con filtros, detalle y anulación con motivo. Reporte de ingresos e impresión.
3. **Parte 3 — P5 seguridad:** login fuera del layout, sesión con vencimiento, cierre automático, aviso previo, dos interceptores, guards y menú/botones por permiso. Una URL manual sin permiso muestra Acceso denegado y conserva la sesión.

La trazabilidad completa está en `docs/TRAZABILIDAD.md`.

## Contrato y decisiones

- El backend es la autoridad de precios, totales, kilometraje, anulación y permisos.
- POST `/ordenes` envía solo `vehiculoId`, `kilometraje` y `detalles[{servicioId,cantidad}]`.
- Los errores de AutoAndes usan **mensaje y campos**; no se copian `message`/`validationErrors` de Pharma.
- Las tablas de servicios, vehículos y órdenes usan paginación del servidor en `/paginado`. Los catálogos para desplegables conservan sus endpoints con arrays.
- El filtro de cliente y los filtros de órdenes se envían al servidor. La búsqueda de servicios se ejecuta en la base de datos antes de paginar.
- La sesión se guarda por pestaña en sessionStorage y no incluye la contraseña. El almacenamiento sigue siendo accesible a JavaScript; la seguridad de las operaciones se verifica en el backend.
- 401 fuera del login elimina la sesión y conserva returnUrl. 403 no elimina la sesión.
- Los formularios no reintentan automáticamente un POST, para evitar registros duplicados si se pierde la respuesta.

## Verificar

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
```

Las pruebas usan las herramientas HTTP de Angular; la aplicación en ejecución siempre consulta el backend real.
Las capturas y el registro de pruebas manuales están en `verificacion/`.

## Versionado

No se hicieron commits, push, merges ni etiquetas por petición del alumno. La revisión y los commits de cada parte quedan a su cargo. La etiqueta `v1.0-examen-u2` corresponde al cierre de la entrega completa, no al desarrollo preliminar.

## Paginación de las listas

Servicios, vehículos y órdenes tienen un paginador compartido con anterior/siguiente y tamaños 5, 10, 20 y 100.
Las tablas consultan `/api/v1/servicios/paginado`, `/vehiculos/paginado` y `/ordenes/paginado`.
Parámetros: `pagina` (desde cero), `tamanio`, `ordenarPor`, `direccion` y los filtros del recurso.
Respuesta: `contenido`, `pagina`, `tamanio`, `totalElementos`, `totalPaginas`, `ultima`, como Pharma.

Los filtros se aplican en Oracle antes del conteo y del recorte; buscar no se limita a la página visible.
Cambiar búsqueda, cliente, fechas, tamaño u orden devuelve a la primera página.
Si se elimina el último registro de la última página, se consulta la página anterior automáticamente.
Los indicadores de importes y estados de órdenes se identifican como correspondientes a la página actual.
El reporte agregado conserva el periodo completo para mantener sus totales e impresión.

Se verificaron 47 pruebas del frontend, 18 del backend y 17 comprobaciones HTTP de paginación contra Oracle.
La documentación de esta ampliación está en `docs/PAGINACION.md`.
