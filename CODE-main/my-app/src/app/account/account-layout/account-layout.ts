import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarCustomer } from '../sidebar-customer/sidebar-customer';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarCustomer],
  templateUrl: './account-layout.html',
  styleUrl: './account-layout.css',
})
export class AccountLayout implements OnInit, OnDestroy {
  notificationBadge: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.notificationBadge = 0;
  }

  ngOnDestroy(): void {
    // no-op
  }
}
