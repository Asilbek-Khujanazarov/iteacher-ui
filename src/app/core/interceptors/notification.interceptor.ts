import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';

@Injectable()
export class NotificationInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Timeout vaqtini 30 sekundga oshiramiz
    const timeoutValue = 40000;

    // Request headers ga timeout qo'shamiz
    const modifiedRequest = request.clone({
      headers: new HttpHeaders({
        ...request.headers.keys().reduce(
          (acc, key) => ({
            ...acc,
            [key]: request.headers.get(key),
          }),
          {},
        ),
        'X-Request-Timeout': timeoutValue.toString(),
      }),
    });

    return next.handle(modifiedRequest).pipe(
      timeout(timeoutValue),
      tap((event: any) => {
        if (event?.body?.message) {
          this.notificationService.show(event.body.message, 'success');
        }
      }),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          this.notificationService.show(
            "Serverga ulanish vaqti oshib ketdi. Iltimos, qaytadan urinib ko'ring.",
            'error',
          );
        } else if (error.error?.message) {
          this.notificationService.show(error.error.message, 'error');
        } else {
          this.notificationService.show(
            "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
            'error',
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
