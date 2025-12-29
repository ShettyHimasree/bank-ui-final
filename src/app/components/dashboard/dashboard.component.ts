import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, Transaction } from '../../auth.service';

@Component({
  selector: 'app-dashboard.component',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  balance: number = 0;
  recentTransactions: Transaction[] = [];
  isLoading: boolean = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Get current balance
    this.authService.balance$.subscribe(balance => {
      this.balance = balance;
    });

    // Get recent transactions (last 5)
    const allTransactions = this.authService.getTransactions();
    this.recentTransactions = allTransactions.slice(0, 5);
    
    this.isLoading = false;
  }

  getTotalDeposits(): number {
    return this.recentTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalWithdrawals(): number {
    return this.recentTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalTransfers(): number {
    return this.recentTransactions
      .filter(t => t.type === 'transfer')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTransactionTypeIcon(type: string): string {
    switch (type) {
      case 'deposit':
        return '⬆️';
      case 'withdraw':
        return '⬇️';
      case 'transfer':
        return '🔄';
      default:
        return '💳';
    }
  }

  getTransactionTypeClass(type: string): string {
    switch (type) {
      case 'deposit':
        return 'transaction-deposit';
      case 'withdraw':
        return 'transaction-withdraw';
      case 'transfer':
        return 'transaction-transfer';
      default:
        return '';
    }
  }
}
