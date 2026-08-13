import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserApiService } from '../../user-api.service';

@Component({
  selector: 'app-forgot-password-gmail',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password-gmail.html',
  styleUrls: ['./forgot-password-gmail.css'],
})
export class ForgotPasswordGmail {
  email = '';
  emailError = '';
  isSubmitting = false;
  submitted = false;

  constructor(
    private router: Router,
    private userApiService: UserApiService
  ) {}

  onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.email = (target.value || '').trim();
    this.emailError = '';
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  clearEmail(): void {
    this.email = '';
    this.emailError = '';
  }

  onSubmit(): void {
    if (!this.isEmailValid()) {
      this.emailError = 'Email khong hop le.';
      return;
    }

    this.isSubmitting = true;
    this.emailError = '';

    this.userApiService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.submitted = true;
        this.isSubmitting = false;
      },
      error: () => {
        // Keep generic UX to avoid account enumeration.
        this.submitted = true;
        this.isSubmitting = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
