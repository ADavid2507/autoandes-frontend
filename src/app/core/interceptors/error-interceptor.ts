import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        req.url.startsWith(environment.apiUrl + '/') &&
        req.url !== environment.apiUrl + '/auth/login'
      )
        auth.cerrarSesion(router.url);
      return throwError(() => error);
    }),
  );
};
