import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isSubmitting = false;
  error = '';
  success = '';

  // inject() style (Angular standalone best practice)
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      accountNumber: [{ value: '123456789', disabled: true }],
      balance: [{ value: '₹ 50,000', disabled: true }],
    });
  }

  // convenience getters for template
  get fullName() { return this.profileForm.get('fullName'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
  get address() { return this.profileForm.get('address'); }
  get dateOfBirth() { return this.profileForm.get('dateOfBirth'); }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.error = 'Please fix validation errors and try again.';
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Profile updated', this.profileForm.value);
      this.success = 'Profile updated successfully ✅';
      this.isSubmitting = false;
    }, 1000);
  }
}
