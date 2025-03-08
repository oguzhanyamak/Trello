import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Subscribable, Subscription } from 'rxjs';

@Component({
  selector: 'home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  // Kullanıcının giriş durumunu takip eden abonelik
  isLoggedInSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Kullanıcının giriş yapıp yapmadığını dinle
    this.isLoggedInSubscription = this.authService.isLogged$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        // Kullanıcı giriş yaptıysa '/boards' sayfasına yönlendir
        this.router.navigateByUrl('/boards');
      }
    });
  }

  ngOnDestroy(): void {
    // Bellek sızıntısını önlemek için aboneliği temizle
    this.isLoggedInSubscription?.unsubscribe();
  }
}
