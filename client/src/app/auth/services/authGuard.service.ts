import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  // Kullanıcının yetkilendirilmiş olup olmadığını kontrol eden metod
  canActivate(): Observable<boolean> {
    return this.authService.isLogged$.pipe(
      map((isLoggedIn) => {
        if (isLoggedIn) {
          return true; // Kullanıcı giriş yaptıysa yönlendirme yapılmaz
        }
        this.router.navigateByUrl('/'); // Kullanıcı giriş yapmadıysa ana sayfaya yönlendirilir
        return false;
      })
    );
  }
}
