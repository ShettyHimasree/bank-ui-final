import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-deposit.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deposit.component.html',
  styleUrl: './deposit.component.css',
})
export class DepositComponent implements OnInit {
  depositForm: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  currentBalance: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      description: ['Deposit', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    // Get current balance
    this.authService.balance$.subscribe(balance => {
      this.currentBalance = balance;
    });
  }

  get amount() {
    return this.depositForm.get('amount');
  }

  get description() {
    return this.depositForm.get('description');
  }

  onAmountInput(event: any): void {
    let value = event.target.value;
    // Remove non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    this.depositForm.patchValue({ amount: value }, { emitEvent: false });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  onSubmit(): void {
    if (this.depositForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';
      this.messageType = '';

      const amount = parseFloat(this.depositForm.value.amount);
      const description = this.depositForm.value.description;

      // Perform deposit operation
      const result = this.authService.deposit(amount, description);

      if (result.success) {
        this.message = result.message;
        this.messageType = 'success';
        
        // Reset form after successful deposit
        this.depositForm.reset({
          amount: '',
          description: 'Deposit'
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/app/dashboard']);
        }, 2000);
      } else {
        this.message = result.message;
        this.messageType = 'error';
      }

      this.isLoading = false;
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.depositForm.controls).forEach(key => {
      const control = this.depositForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.depositForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('min')) {
      return 'Amount must be at least ₹0.01';
    }
    if (control?.hasError('max')) {
      return 'Amount cannot exceed ₹9,99,999.99';
    }
    if (control?.hasError('minlength')) {
      return 'Description must be at least 3 characters';
    }
    if (control?.hasError('maxlength')) {
      return 'Description cannot exceed 100 characters';
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }
}
