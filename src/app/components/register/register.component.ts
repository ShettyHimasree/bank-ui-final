import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';

  // inject() style (Angular standalone best practice)
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      residentialAddress: ['', [Validators.required]],
      idType: ['', [Validators.required]],
      idNumber: ['', [Validators.required]],
      declaration: [false, [Validators.requiredTrue]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],
    });
  }

  // convenience getters for template
  get fullName() { return this.registerForm.get('fullName'); }
  get dob() { return this.registerForm.get('dob'); }
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get residentialAddress() { return this.registerForm.get('residentialAddress'); }
  get idType() { return this.registerForm.get('idType'); }
  get idNumber() { return this.registerForm.get('idNumber'); }
  get declaration() { return this.registerForm.get('declaration'); }
  get password() { return this.registerForm.get('password'); }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Please fix validation errors and try again.';
      return;
    }

    this.isSubmitting = true;

    const userData = this.registerForm.value; // { fullName, email, accountNumber, password }

    this.authService.register(userData).subscribe({
      next: (res: any) => {
        console.log('Registration successful', res);
        this.success = 'Registration successful! Please login with your credentials.';
        this.registerForm.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Registration failed', err);
        const apiMsg = err?.error?.message || err?.message;
        this.error = apiMsg ? `Registration failed: ${apiMsg}` : 'Registration failed ❌';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
