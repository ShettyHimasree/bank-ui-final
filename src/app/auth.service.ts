import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  accountNumber: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  description: string;
  date: Date;
  fromAccount?: string;
  toAccount?: string;
  balance: number;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly AUTH_KEY = 'bank_app_user';
  private readonly LOGIN_KEY = 'bank_app_is_logged_in';
  private readonly BALANCE_KEY = 'bank_app_balance';
  private readonly TRANSACTIONS_KEY = 'bank_app_transactions';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.getLoginStatus());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private balanceSubject = new BehaviorSubject<number>(this.getCurrentBalance());
  public balance$ = this.balanceSubject.asObservable();

  // Mock user database - in real app, this would be on backend
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      accountNumber: '1234567890'
    },
    {
      id: '2', 
      email: 'user@bank.com',
      username: 'johndoe',
      fullName: 'John Doe',
      accountNumber: '0987654321'
    }
  ];

  constructor() { }

  login(credentials: LoginCredentials): Observable<any> {
    // Simulate API delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Mock validation - accept any username with password length >= 8
        if (credentials.password.length >= 8) {
          const user = this.mockUsers.find(u => u.username === credentials.username) || {
            id: Date.now().toString(),
            email: `${credentials.username}@example.com`,
            username: credentials.username,
            fullName: credentials.username,
            accountNumber: this.generateAccountNumber()
          };

          // Store user data
          localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
          localStorage.setItem(this.LOGIN_KEY, 'true');
          
          // Update subjects
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);

          return {
            success: true,
            user: user,
            message: 'Login successful'
          };
        } else {
          throw new Error('Invalid credentials. Password must be at least 8 characters.');
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    // Simulate API delay
    return of(null).pipe(
      delay(1000),
      map(() => {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          username: userData.username,
          fullName: userData.fullName,
          accountNumber: userData.accountNumber || this.generateAccountNumber()
        };

        // Add to mock users
        this.mockUsers.push(newUser);

        // Store user data
        localStorage.setItem(this.AUTH_KEY, JSON.stringify(newUser));
        localStorage.setItem(this.LOGIN_KEY, 'true');
        
        // Update subjects
        this.currentUserSubject.next(newUser);
        this.isLoggedInSubject.next(true);

        return {
          success: true,
          user: newUser,
          message: 'Registration successful'
        };
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.LOGIN_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.LOGIN_KEY) === 'true';
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.AUTH_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private getLoginStatus(): boolean {
    return localStorage.getItem(this.LOGIN_KEY) === 'true';
  }

  private generateAccountNumber(): string {
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  }

  // Balance Management
  getCurrentBalance(): number {
    const balanceStr = localStorage.getItem(`${this.AUTH_KEY}_${this.getCurrentUser()?.id}_balance`);
    return balanceStr ? parseFloat(balanceStr) : 1000.00; // Default starting balance
  }

  updateBalance(amount: number, operation: 'add' | 'subtract'): void {
    const currentBalance = this.getCurrentBalance();
    const newBalance = operation === 'add' 
      ? currentBalance + amount 
      : currentBalance - amount;
    
    if (newBalance >= 0) {
      const user = this.getCurrentUser();
      if (user) {
        localStorage.setItem(`${this.AUTH_KEY}_${user.id}_balance`, newBalance.toString());
        this.balanceSubject.next(newBalance);
      }
    }
  }

  // Transaction Management
  getTransactions(): Transaction[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const transactionsStr = localStorage.getItem(`${this.AUTH_KEY}_${user.id}_transactions`);
    if (transactionsStr) {
      try {
        return JSON.parse(transactionsStr).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
      } catch {
        return [];
      }
    }
    return [];
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const user = this.getCurrentUser();
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTransaction); // Add to beginning
    
    localStorage.setItem(`${this.AUTH_KEY}_${user.id}_transactions`, JSON.stringify(transactions));
  }

  // Deposit operation
  deposit(amount: number, description: string = 'Deposit'): { success: boolean; message: string } {
    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    this.updateBalance(amount, 'add');
    
    this.addTransaction({
      type: 'deposit',
      amount,
      description,
      date: new Date(),
      balance: this.getCurrentBalance()
    });

    return { success: true, message: 'Deposit successful' };
  }

  // Withdraw operation
  withdraw(amount: number, description: string = 'Withdrawal'): { success: boolean; message: string } {
    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    const currentBalance = this.getCurrentBalance();
    if (amount > currentBalance) {
      return { success: false, message: 'Insufficient balance' };
    }

    this.updateBalance(amount, 'subtract');
    
    this.addTransaction({
      type: 'withdraw',
      amount,
      description,
      date: new Date(),
      balance: this.getCurrentBalance()
    });

    return { success: true, message: 'Withdrawal successful' };
  }

  // Transfer operation
  transfer(amount: number, toAccount: string, description: string = 'Transfer'): { success: boolean; message: string } {
    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    const currentBalance = this.getCurrentBalance();
    if (amount > currentBalance) {
      return { success: false, message: 'Insufficient balance' };
    }

    // Check if recipient account exists in mock users
    const recipient = this.mockUsers.find(u => u.accountNumber === toAccount);
    if (!recipient) {
      return { success: false, message: 'Recipient account not found' };
    }

    const user = this.getCurrentUser();
    if (user && user.accountNumber === toAccount) {
      return { success: false, message: 'Cannot transfer to your own account' };
    }

    this.updateBalance(amount, 'subtract');
    
    this.addTransaction({
      type: 'transfer',
      amount,
      description,
      date: new Date(),
      fromAccount: user?.accountNumber,
      toAccount,
      balance: this.getCurrentBalance()
    });

    return { success: true, message: 'Transfer successful' };
  }

  // Contact form submission
  submitContactForm(formData: ContactForm): Observable<{ success: boolean; message: string }> {
    // Simulate API call
    return of(null).pipe(
      delay(1000),
      map(() => {
        // In real app, this would send email or store in database
        console.log('Contact form submitted:', formData);
        return {
          success: true,
          message: 'Your message has been sent successfully. We will get back to you soon!'
        };
      })
    );
  }
}
