import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginCredentials } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';

  // Angular standalone inject style
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['testuser', [Validators.required]], // Pre-fill for testing
      password: ['password123', [Validators.required, Validators.minLength(8)]] // Pre-fill for testing
    });
  }

  // getters for template
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.error = 'Please fix validation errors and try again.';
      return;
    }

    this.isSubmitting = true;

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        console.log('Login successful', res);

        this.success = 'Login successful! Redirecting...';
        this.loginForm.reset();

        // ✅ REDIRECT TO PRIVATE LAYOUT
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 500);
      },
      error: (err: any) => {
        console.error('Login failed', err);
        const apiMsg = err?.message || err?.error?.message;
        this.error = apiMsg ? `Login failed: ${apiMsg}` : 'Login failed. Please check your credentials.';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  // Helper method for quick testing
  quickLogin() {
    this.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
  }
}
