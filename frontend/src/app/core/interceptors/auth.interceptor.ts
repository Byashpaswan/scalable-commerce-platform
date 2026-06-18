import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();
  const correlationId = 'req-' + Math.random().toString(36).substring(2, 15);

  let clonedRequest = req.clone({
    headers: req.headers.set('x-correlation-id', correlationId)
  });

  if (token) {
    clonedRequest = clonedRequest.clone({
      headers: clonedRequest.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(clonedRequest);
};
