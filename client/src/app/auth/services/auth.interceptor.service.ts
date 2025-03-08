import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

// HTTP isteklerini yakalayarak yetkilendirme (auth) için başlık ekleyen interceptor
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Tarayıcıdaki localStorage'dan 'token' değerini al
    const token = localStorage.getItem('token');

    // Mevcut isteği klonlayarak Authorization başlığı ekle
    req = req.clone({
      setHeaders: {
        Authorization: token ?? '', // Eğer token yoksa boş bir string eklenir
      },
    });

    // Güncellenmiş isteği işlemeye devam et
    return next.handle(req);
  }
}
