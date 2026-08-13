import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserApiService } from '../../user-api.service';

@Component({
  selector: 'app-forgot-password-reset',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password-reset.html',
  styleUrls: ['./forgot-password-reset.css'],
})
export class ForgotPasswordReset implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  token: string = '';

  passwordError: string = '';
  confirmError: string = '';
  submitError: string = '';

  showPassword: boolean = false;
  showConfirm: boolean = false;

  showSuccessMessage: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = (params.get('token') || '').trim();

      if (!this.token) {
        this.submitError = 'Lien ket dat lai mat khau khong hop le hoac da het han.';
      }
    });
  }

  onPasswordInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.password = target.value;
    this.passwordError = '';
    this.submitError = '';
    this.validatePassword();
    this.validateConfirm();
  }

  onConfirmInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.confirmPassword = target.value;
    this.confirmError = '';
    this.submitError = '';
    this.validateConfirm();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  validatePassword(): void {
    this.passwordError = '';

    if (this.password.length < 8) {
      this.passwordError = 'Mat khau phai co it nhat 8 ky tu.';
      return;
    }

    if (!/[A-Z]/.test(this.password)) {
      this.passwordError = 'Mat khau phai co it nhat 1 chu cai in hoa.';
      return;
    }

    if (!/[a-z]/.test(this.password)) {
      this.passwordError = 'Mat khau phai co it nhat 1 chu cai thuong.';
    }
  }

  validateConfirm(): void {
    if (this.confirmPassword && this.password !== this.confirmPassword) {
      this.confirmError = 'Mat khau nhap lai khong khop.';
    } else {
      this.confirmError = '';
    }
  }

  isFormValid(): boolean {
    return (
      !!this.token &&
      this.password.length >= 8 &&
      /[A-Z]/.test(this.password) &&
      /[a-z]/.test(this.password) &&
      this.password === this.confirmPassword &&
      !this.passwordError &&
      !this.confirmError
    );
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isSubmitting) {
      return;
    }

    if (!this.isFormValid()) {
      this.submitError = this.submitError || 'Vui long kiem tra lai thong tin.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    this.userApiService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.submitError =
          error?.error?.message || 'Lien ket khong hop le, da het han, hoac co loi may chu.';
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
