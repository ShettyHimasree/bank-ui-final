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
    // Generate a 10-digit random account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      residentialAddress: ['', [Validators.required]],
      preferredAccountType: ['savings', [Validators.required]], // default to savings
      preferredCurrency: ['USD', [Validators.required]],
      otherCurrency: [''], // only required if preferredCurrency is 'other'
      initialDepositAmount: ['', [Validators.required, Validators.min(0)]],
      idType: ['', [Validators.required]],
      idNumber: ['', [Validators.required]],
      occupation: ['', [Validators.required]],
      employerName: ['', [Validators.required]],
      declaration: [false, [Validators.requiredTrue]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]], // current date
      accountNumber: [{ value: accountNumber, disabled: true }, [Validators.required]], // auto-generated and readonly
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
          // If you want strong password enforcement on register too, add:
          // Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\;:'",.<>\?/\-]).{8,}$/)
        ]
      ],
    });

    // Conditional validation for otherCurrency
    this.registerForm.get('preferredCurrency')?.valueChanges.subscribe(value => {
      const otherCurrencyControl = this.registerForm.get('otherCurrency');
      if (value === 'other') {
        otherCurrencyControl?.setValidators([Validators.required]);
      } else {
        otherCurrencyControl?.clearValidators();
      }
      otherCurrencyControl?.updateValueAndValidity();
    });
  }

  // convenience getters for template
  get fullName() { return this.registerForm.get('fullName'); }
  get dob() { return this.registerForm.get('dob'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get email() { return this.registerForm.get('email'); }
  get residentialAddress() { return this.registerForm.get('residentialAddress'); }
  get preferredAccountType() { return this.registerForm.get('preferredAccountType'); }
  get preferredCurrency() { return this.registerForm.get('preferredCurrency'); }
  get otherCurrency() { return this.registerForm.get('otherCurrency'); }
  get initialDepositAmount() { return this.registerForm.get('initialDepositAmount'); }
  get idType() { return this.registerForm.get('idType'); }
  get idNumber() { return this.registerForm.get('idNumber'); }
  get occupation() { return this.registerForm.get('occupation'); }
  get employerName() { return this.registerForm.get('employerName'); }
  get declaration() { return this.registerForm.get('declaration'); }
  get date() { return this.registerForm.get('date'); }
  get accountNumber() { return this.registerForm.get('accountNumber'); }
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
        this.success = 'Registration successful! Redirecting to dashboard...';
        this.registerForm.reset();
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 500);
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
