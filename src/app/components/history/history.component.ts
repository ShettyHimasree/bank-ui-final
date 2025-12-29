import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Transaction } from '../../auth.service';

@Component({
  selector: 'app-history.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Filter and search
  searchTerm: string = '';
  filterType: string = 'all'; // 'all', 'deposit', 'withdraw', 'transfer'
  sortBy: string = 'date'; // 'date', 'amount', 'type', 'description'
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Loading state
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    // Get all transactions from AuthService
    this.allTransactions = this.authService.getTransactions();
    
    // Apply filters and sorting
    this.applyFiltersAndSort();
    
    this.isLoading = false;
  }

  applyFiltersAndSort(): void {
    let filtered = [...this.allTransactions];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.type.toLowerCase().includes(searchLower) ||
        (transaction.fromAccount && transaction.fromAccount.includes(this.searchTerm)) ||
        (transaction.toAccount && transaction.toAccount.includes(this.searchTerm))
      );
    }

    // Apply type filter
    if (this.filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === this.filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredTransactions = filtered;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedTransactions(): Transaction[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTransactions.slice(startIndex, endIndex);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  onSortChange(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'desc';
    }
    this.applyFiltersAndSort();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
        return 'type-deposit';
      case 'withdraw':
        return 'type-withdraw';
      case 'transfer':
        return 'type-transfer';
      default:
        return '';
    }
  }

  getTransactionAmountClass(transaction: Transaction): string {
    switch (transaction.type) {
      case 'deposit':
        return 'amount-positive';
      case 'withdraw':
        return 'amount-negative';
      case 'transfer':
        return 'amount-neutral';
      default:
        return '';
    }
  }

  getTransactionAmount(transaction: Transaction): string {
    switch (transaction.type) {
      case 'deposit':
        return `+${this.formatCurrency(transaction.amount)}`;
      case 'withdraw':
        return `-${this.formatCurrency(transaction.amount)}`;
      case 'transfer':
        return this.formatCurrency(transaction.amount);
      default:
        return this.formatCurrency(transaction.amount);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }

  exportTransactions(): void {
    // Create CSV content
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Balance', 'From Account', 'To Account'];
    const csvContent = [
      headers.join(','),
      ...this.filteredTransactions.map(transaction => [
        this.formatDate(transaction.date),
        transaction.type,
        `"${transaction.description}"`,
        transaction.amount,
        transaction.balance,
        transaction.fromAccount || '',
        transaction.toAccount || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterType = 'all';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  // Helper method for template
  getCurrentPageEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredTransactions.length);
  }
}
