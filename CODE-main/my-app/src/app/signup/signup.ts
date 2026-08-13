import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../user-api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {

  signupForm: FormGroup;
  submitAttempted = false;

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

  passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  constructor(
    private fb: FormBuilder,
    private userApi: UserApiService,
    private router: Router
  ) {

    this.signupForm = this.fb.group({
      profileName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required],
      gender: [''],
      birthDay: ['', Validators.required],
      birthMonth: ['', Validators.required],
      birthYear: ['', Validators.required],
      marketing: [false]
    }, { validators: this.passwordMatch });

    this.signupForm.get('password')?.valueChanges.subscribe(value => {
      this.checkPasswordRequirements(value);
    });

  }

  passwordStrengthValidator = (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const hasLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const isValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

    return isValid ? null : { weakPassword: true };
  }

  checkPasswordRequirements(password: string) {
    this.passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  isPasswordStrong(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  passwordMatch(group: AbstractControl) {

    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password !== confirm) {
      return { mismatch: true };
    }

    return null;
  }

  private normalizeGender(value: unknown): 'male' | 'female' | 'other' {
    const raw = String(value ?? '').trim().toLowerCase();
    if (['female', 'nu', 'nữ'].includes(raw)) return 'female';
    if (['male', 'nam'].includes(raw)) return 'male';
    return 'other';
  }

  onSubmit() {

    this.submitAttempted = true;

    if (this.signupForm.invalid) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const payload = {
      ...this.signupForm.value,
      gender: this.normalizeGender(this.signupForm.value.gender),
    };

    console.log("Signup data:", payload);

    this.userApi.register(payload).subscribe(
      (res: any) => {
        alert("Đăng ký thành công");
        this.router.navigate(['/login']);
      },
      (err: any) => {
        console.log(err);
        alert("Đăng ký thất bại");
      }
    );

  }

}