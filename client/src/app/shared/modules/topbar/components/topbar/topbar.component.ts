import { Component } from '@angular/core';
import { AuthService } from '../../../../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
