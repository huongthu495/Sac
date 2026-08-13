import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistApiService } from '../../wishlist-api.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  wishlistItems: any[] = [];
  loading = false;
  userId: string = '';

  constructor(private wishlistApiService: WishlistApiService) {
    // Kiểm tra localStorage có tồn tại (tránh lỗi SSR)
    if (typeof localStorage !== 'undefined') {
      this.userId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
    }
  }

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistItems = this.wishlistApiService.getWishlistByUser(this.userId);
    this.loading = false;
  }

  removeFromWishlist(wishlistId: string): void {
    this.wishlistApiService.removeFromWishlist(wishlistId);
    this.loadWishlist();
  }

  clearWishlist(): void {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?')) {
      this.wishlistApiService.clearWishlist(this.userId);
      this.loadWishlist();
    }
  }

  getProductId(item: any): string {
    return item?.productId || item?.productSku || '';
  }
}