import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../auth.service';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

@Component({
  selector: 'app-contact.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  currentUser: User | null = null;
  
  // Predefined subjects for better organization
  subjectOptions = [
    'General Inquiry',
    'Account Issues',
    'Transaction Problems',
    'Technical Support',
    'Security Concerns',
    'Billing Questions',
    'Feature Request',
    'Bug Report',
    'Other'
  ];

  // Contact categories
  categories = [
    { value: 'support', label: 'Customer Support' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Accounts' },
    { value: 'security', label: 'Security & Fraud' },
    { value: 'general', label: 'General Questions' }
  ];

  // Quick contact information
  contactInfo = {
    phone: '1-800-BANK-123',
    email: 'support@bankapp.com',
    hours: '24/7 Customer Support',
    emergency: '1-800-EMERGENCY'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      category: ['', [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Auto-fill form if user is logged in
      if (user) {
        this.contactForm.patchValue({
          name: user.fullName,
          email: user.email
        });
      }
    });
  }

  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get category() {
    return this.contactForm.get('category');
  }

  get subject() {
    return this.contactForm.get('subject');
  }

  get messageField() {
    return this.contactForm.get('message');
  }

  onSubjectChange(): void {
    const selectedSubject = this.contactForm.value.subject;
    
    // Auto-suggest subject based on category
    if (selectedSubject === 'General Inquiry') {
      this.suggestSubject('General Inquiry');
    } else if (selectedSubject === 'Account Issues') {
      this.suggestSubject('Account Access Issues');
    } else if (selectedSubject === 'Transaction Problems') {
      this.suggestSubject('Transaction Problem');
    } else if (selectedSubject === 'Technical Support') {
      this.suggestSubject('Technical Support Request');
    } else if (selectedSubject === 'Security Concerns') {
      this.suggestSubject('Security Concern');
    } else if (selectedSubject === 'Billing Questions') {
      this.suggestSubject('Billing Question');
    } else if (selectedSubject === 'Feature Request') {
      this.suggestSubject('Feature Request');
    } else if (selectedSubject === 'Bug Report') {
      this.suggestSubject('Bug Report');
    }
  }

  suggestSubject(baseSubject: string): void {
    this.contactForm.patchValue({ subject: baseSubject });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = '';
      this.messageType = '';

      // Simulate form submission
      setTimeout(() => {
        const formData: ContactForm = this.contactForm.value;
        
        // In a real application, this would be sent to a backend
        console.log('Contact form submitted:', {
          ...formData,
          userId: this.currentUser?.id,
          timestamp: new Date(),
          status: 'received'
        });

        // Simulate success response
        this.message = `Thank you for contacting us! Your ${formData.category} inquiry has been received. Our team will respond within 24 hours. Reference ID: CT-${Date.now().toString().slice(-6)}`;
        this.messageType = 'success';
        
        // Reset form but keep user info
        this.contactForm.reset({
          name: this.currentUser?.fullName || '',
          email: this.currentUser?.email || '',
          category: '',
          subject: '',
          message: ''
        });

        this.isLoading = false;
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${maxLength} characters`;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }

  clearForm(): void {
    this.contactForm.reset({
      name: this.currentUser?.fullName || '',
      email: this.currentUser?.email || '',
      category: '',
      subject: '',
      message: ''
    });
    this.message = '';
    this.messageType = '';
  }

  getRemainingChars(): number {
    const currentLength = this.messageField?.value?.length || 0;
    return 2000 - currentLength;
  }

  // Quick contact methods
  callSupport(): void {
    window.open(`tel:${this.contactInfo.phone}`, '_self');
  }

  emailSupport(): void {
    const subject = encodeURIComponent('Support Request from Bank App');
    const body = encodeURIComponent(`Hello,\n\nI would like to request assistance with my account.\n\nAccount: ${this.currentUser?.accountNumber || 'N/A'}\nEmail: ${this.currentUser?.email || 'N/A'}\n\nThank you!`);
    window.open(`mailto:${this.contactInfo.email}?subject=${subject}&body=${body}`, '_self');
  }

  callEmergency(): void {
    window.open(`tel:${this.contactInfo.emergency}`, '_self');
  }
}
