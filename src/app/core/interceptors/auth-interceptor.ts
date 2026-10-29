import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const api = req.url === environment.apiUrl || req.url.startsWith(environment.apiUrl + '/');
  return next(api && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
