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
  error: string | null = null;
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.authService.register(this.form.value).subscribe({
      next: (currentUser) => {
        this.authService.setToken(currentUser);
        this.authService.setCurrentUser(currentUser);
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error.join(', ');
      },
    });
  }
}
