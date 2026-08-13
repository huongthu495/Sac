import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../../user-api.service';
import { Account } from '../../models/Account';

interface SidebarMenuItem {
  id: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-customer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-customer.html',
  styleUrl: './sidebar-customer.css',
})
export class SidebarCustomer implements OnInit {

  @Input() notificationBadge: number = 0;

  isMobileSidebarOpen = false;
  user: Account | null = null;
  userName = 'Khách hàng';
  userEmail = '';
  userAvatar = '/assets/user.png';

  menuItems: SidebarMenuItem[] = [
    { id: 'profile', label: 'Tài khoản cá nhân', route: '/account/profile' },
    { id: 'address', label: 'Sổ địa chỉ', route: '/account/address' },
    { id: 'orders', label: 'Đơn hàng', route: '/account/orders' },
    { id: 'wishlist', label: 'Yêu thích', route: '/account/wishlist' },
  ];

  constructor(
    private router: Router,
    private userApi: UserApiService
  ) {}

  get hasCustomAvatar(): boolean {
    const avatar = String(this.userAvatar ?? '').trim().toLowerCase();
    if (!avatar) {
      return false;
    }
    return !(
      avatar === '/assets/user.png' ||
      avatar.endsWith('/assets/user.png') ||
      avatar.endsWith('assets/user.png')
    );
  }

  ngOnInit(): void {
    this.loadUserInfo();

    this.userApi.currentUser$.subscribe((user) => {

      if (user) {
        this.user = user;

        this.userName = user.profileName || 'Khách hàng';
        this.userEmail = user.email || '';
        this.userAvatar = user.avatar || '/assets/user.png';
      } else {
        this.userName = 'Khách hàng';
        this.userEmail = '';
        this.userAvatar = '/assets/user.png';
      }

    });
  }

  private loadUserInfo(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      this.userName = user.profileName || user.fullName || user.FullName || 'Khách hàng';
      this.userEmail = user.email || user.Email || '';
      this.userAvatar = user.avatar || '/assets/user.png';
    } catch {
      this.userName = 'Khách hàng';
      this.userEmail = '';
      this.userAvatar = '/assets/user.png';
    }
  }
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  onLogout(): void {
    this.userApi.logout(); 
    this.closeMobileSidebar();
    this.router.navigate(['/login']);
  }
}