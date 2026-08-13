import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './qr.html',
  styleUrls: ['./qr.css'],
})
export class Qr {
  isVisible = false;
  activeTab: 'momo' | 'internet_banking' | 'zalopage' = 'momo';
  selectedBank = 'vietcombank';
  countdown = 60;
  private timer: any = null;
  confirmed = false;

  @Output() paymentConfirmed = new EventEmitter<void>();

  open(initialTab: 'momo' | 'internet_banking' | 'zalopage' = 'momo') {
    this.activeTab = initialTab;
    this.isVisible = true;
    this.selectedBank = 'vietcombank';
    this.countdown = 60;
    this.confirmed = false;
    this.startCountdown();
  }

  closeModal() {
    this.isVisible = false;
    this.stopCountdown();
    this.confirmed = false;
  }

  switchTab(tab: 'momo' | 'internet_banking' | 'zalopage') {
    this.activeTab = tab;
  }

  confirmPayment() {
    if (this.confirmed) return;
    // mark confirmed locally to show success immediately
    this.confirmed = true;
    // emit event so parent can create order / verify
    this.paymentConfirmed.emit();
    // auto-close shortly after showing success
    setTimeout(() => {
      this.closeModal();
    }, 1400);
  }

  private startCountdown() {
    this.stopCountdown();
    this.timer = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown <= 0) {
        this.closeModal();
      }
    }, 1000);
  }

  private stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
