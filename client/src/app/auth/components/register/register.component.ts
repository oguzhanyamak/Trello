import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'auth-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  // API'den gelen hata mesajlarını saklamak için değişken
  errorMessage: string | null = null;

  // Kayıt formu için FormGroup nesnesi
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    // Form alanlarını oluştur ve doğrulama kurallarını belirle
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email alanı zorunlu ve geçerli email formatında olmalı
      username: ['', Validators.required], // Kullanıcı adı zorunlu
      password: ['', Validators.required], // Şifre zorunlu
    });
  }

  // Form gönderildiğinde çalışacak metod
  onSubmit(): void {
    this.authService.register(this.form.value).subscribe({
      next: (currentUser) => {
        // Kullanıcı başarıyla kayıt olduysa token'ı kaydet
        this.authService.setToken(currentUser);
        // Mevcut kullanıcıyı güncelle
        this.authService.setCurrentUser(currentUser);
        // Hata mesajını sıfırla
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        // API'den dönen hataları göster
        this.errorMessage = err.error.join(', ');
      },
    });
  }
}

