import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserApiService } from '../../user-api.service';
import { Account } from '../../models/Account';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-information.html',
  styleUrl: './personal-information.css',
})
export class PersonalInformation implements OnInit {

  userId = '';
  isSaving = false;
  isBrowser = false;

  form: Account = {
    profileName: '',
    email: '',
    phone: '',
    gender: 'other',
    avatar: '/assets/user.png',
  };

  get hasCustomAvatar(): boolean {
    const avatar = String(this.form.avatar ?? '').trim().toLowerCase();
    if (!avatar) {
      return false;
    }
    return !(
      avatar === '/assets/user.png' ||
      avatar.endsWith('/assets/user.png') ||
      avatar.endsWith('assets/user.png')
    );
  }

  constructor(
    private userApi: UserApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private normalizeGender(value: unknown): 'male' | 'female' | 'other' {
    const raw = String(value ?? '').trim().toLowerCase();
    if (['female', 'nu', 'nữ'].includes(raw)) return 'female';
    if (['male', 'nam'].includes(raw)) return 'male';
    return 'other';
  }

  ngOnInit(): void {

    if (!this.isBrowser) return;

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      this.userId = '';
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      this.userId = user._id || user.id || '';
      this.form.profileName = user.profileName || user.fullName || user.FullName || '';
      this.form.email = user.email || user.Email || '';
      this.form.phone = user.phone || user.Phone || user.phoneNumber || '';
      this.form.gender = this.normalizeGender(user.gender || user.Gender || user.gioiTinh);
      this.form.birthDay = user.birthDay;
      this.form.birthMonth = user.birthMonth;
      this.form.birthYear = user.birthYear;
      this.form.avatar = user.avatar || '/assets/user.png';

      if (this.userId) {
        this.userApi.getUser(this.userId).subscribe({
          next: (res: any) => {
            this.form = {
              ...this.form,
              ...res,
              profileName: res.profileName || this.form.profileName,
              gender: this.normalizeGender(res.gender || res.Gender || this.form.gender),
              birthDay: res.birthDay || res.birth_day || this.form.birthDay,
              birthMonth: res.birthMonth || res.birth_month || this.form.birthMonth,
              birthYear: res.birthYear || res.birth_year || this.form.birthYear,
              avatar: res.avatar || '/assets/user.png',
            };

            const merged = { ...user, ...this.form, _id: this.userId };
            localStorage.setItem('user', JSON.stringify(merged));
            this.userApi.setUser(merged);
          },
          error: () => {
            // Keep local data as fallback.
          },
        });
      }
    } catch {
      this.userId = '';
    }
  }

  saveProfile(): void {
    if (!this.userId || this.isSaving) return;

    this.isSaving = true;
    const payload = {
      ...this.form,
      gender: this.normalizeGender(this.form.gender),
    };

    this.userApi.updateUser(this.userId, payload).subscribe({
      next: (updated: any) => {
        const merged = {
          ...this.form,
          ...updated,
          gender: this.normalizeGender(updated?.gender || payload.gender),
          _id: this.userId,
        };
        if (this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(merged));
        }
        this.userApi.setUser(merged);

        this.isSaving = false;
        alert('Cập nhật thông tin thành công');
      },
      error: () => {
        this.isSaving = false;
        alert('Cập nhật thất bại, vui lòng thử lại');
      },
    });
  }
}