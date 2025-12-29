import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../auth.service';

@Component({
  selector: 'app-transfer.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css',
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  currentBalance: number = 0;
  currentUser: User | null = null;
  recipientUser: User | null = null;
  availableAccounts: User[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.transferForm = this.fb.group({
      toAccount: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      description: ['Transfer', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    // Get current user and balance
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.balance$.subscribe(balance => {
      this.currentBalance = balance;
    });

    // Load available accounts (excluding current user)
    this.loadAvailableAccounts();
  }

  get toAccount() {
    return this.transferForm.get('toAccount');
  }

  get amount() {
    return this.transferForm.get('amount');
  }

  get description() {
    return this.transferForm.get('description');
  }

  onAccountInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) {
      value = value.substring(0, 10); // Limit to 10 digits
    }
    this.transferForm.patchValue({ toAccount: value }, { emitEvent: false });
    
    // Check for recipient when account number changes
    this.findRecipient();
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
    this.transferForm.patchValue({ amount: value }, { emitEvent: false });
  }

  findRecipient(): void {
    const accountNumber = this.transferForm.value.toAccount;
    if (accountNumber && accountNumber.length === 10) {
      const recipient = this.availableAccounts.find(user => user.accountNumber === accountNumber);
      this.recipientUser = recipient || null;
    } else {
      this.recipientUser = null;
    }
  }

  loadAvailableAccounts(): void {
    // Get mock users and filter out current user
    this.availableAccounts = this.authService['mockUsers'].filter((user: User) => 
      user.id !== this.currentUser?.id
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatAccountNumber(accountNumber: string): string {
    return accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
  }

  onSubmit(): void {
    if (this.transferForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';
      this.messageType = '';

      const toAccount = this.transferForm.value.toAccount;
      const amount = parseFloat(this.transferForm.value.amount);
      const description = this.transferForm.value.description;

      // Validate transfer
      if (toAccount === this.currentUser?.accountNumber) {
        this.message = 'You cannot transfer money to your own account.';
        this.messageType = 'error';
        this.isLoading = false;
        this.markFormGroupTouched();
        return;
      }

      if (!this.recipientUser) {
        this.message = 'Recipient account not found. Please check the account number.';
        this.messageType = 'error';
        this.isLoading = false;
        this.markFormGroupTouched();
        return;
      }

      if (amount > this.currentBalance) {
        this.message = 'Insufficient balance. You cannot transfer more than your current balance.';
        this.messageType = 'error';
        this.isLoading = false;
        this.markFormGroupTouched();
        return;
      }

      // Perform transfer operation
      const result = this.authService.transfer(amount, toAccount, description);

      if (result.success) {
        this.message = `Transfer successful! ${this.formatCurrency(amount)} sent to ${this.recipientUser.fullName}`;
        this.messageType = 'success';
        
        // Reset form after successful transfer
        this.transferForm.reset({
          toAccount: '',
          amount: '',
          description: 'Transfer'
        });
        this.recipientUser = null;

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
    Object.keys(this.transferForm.controls).forEach(key => {
      const control = this.transferForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.transferForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName === 'toAccount' ? 'Recipient account number' : fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('pattern')) {
      return 'Account number must be exactly 10 digits';
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

  // Helper method to check if transfer would exceed balance
  wouldExceedBalance(): boolean {
    const amount = parseFloat(this.transferForm.value.amount || '0');
    return amount > this.currentBalance;
  }

  // Helper method to get new balance after transfer
  getNewBalance(): number {
    const amount = parseFloat(this.transferForm.value.amount || '0');
    return this.currentBalance - amount;
  }
}
