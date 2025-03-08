import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'auth-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // API'den gelen hata mesajlarını saklamak için değişken
  errorMessage: string | null = null;

  // Giriş formu için FormGroup nesnesi
  form: FormGroup;

  constructor(
    private fb: FormBuilder, // FormBuilder servisi ile form oluşturulacak
    private authService: AuthService, // AuthService servisi ile giriş işlemi yapılacak
    private router: Router // Router servisi ile yönlendirme yapılacak
  ) {
    // Form alanlarını oluştur ve doğrulama kurallarını belirle
    this.form = this.fb.group({
      email: ['', Validators.required], // Email alanı zorunlu
      password: ['', Validators.required], // Şifre alanı zorunlu
    });
  }

  // Form gönderildiğinde çalışacak metod
  onSubmit(): void {
    // AuthService'in login metodunu çağır ve kullanıcıyı giriş yaptır
    this.authService.login(this.form.value).subscribe({
      next: (currentUser) => {
        // Giriş başarılıysa, currentUser bilgilerini kaydet
        console.log('currentUser', currentUser); // Geliştirme aşamasında currentUser'ı konsola yazdır
        this.authService.setToken(currentUser); // Token'ı localStorage'e kaydet
        this.authService.setCurrentUser(currentUser); // Kullanıcıyı authService ile güncelle
        this.errorMessage = null; // Hata mesajını temizle
        this.router.navigateByUrl('/'); // Ana sayfaya yönlendir
      },
      error: (err: HttpErrorResponse) => {
        // Giriş sırasında hata oluşursa, hata mesajını göster
        console.log('err', err.error); // Hata detaylarını konsola yazdır
        this.errorMessage = err.error.message; // API'den dönen hata mesajını kullanıcıya göster
      },
    });
  }
}

