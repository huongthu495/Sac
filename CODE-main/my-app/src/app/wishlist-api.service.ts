import { Injectable } from '@angular/core';

// Local storage based wishlist service
@Injectable({
  providedIn: 'root',
})
export class WishlistApiService {
  private readonly WISHLIST_KEY = 'userWishlist';

  constructor() {}

  // Get all wishlist items for a user
  getWishlistByUser(userId: string): any[] {
    const wishlist = localStorage.getItem(this.WISHLIST_KEY);
    if (!wishlist) return [];
    const allWishlist = JSON.parse(wishlist);
    return allWishlist.filter((item: any) => item.userId === userId);
  }

  // Add item to wishlist
  addToWishlist(wishlistData: any): any {
    const wishlist = localStorage.getItem(this.WISHLIST_KEY);
    const allWishlist = wishlist ? JSON.parse(wishlist) : [];
    
    // Check if already exists
    const exists = allWishlist.find((item: any) => 
      item.userId === wishlistData.userId && item.productId === wishlistData.productId
    );
    
    if (exists) {
      return exists;
    }
    
    const newItem = {
      _id: Date.now().toString(),
      ...wishlistData,
      createdAt: new Date().toISOString(),
    };
    
    allWishlist.push(newItem);
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(allWishlist));
    return newItem;
  }

  // Remove item from wishlist
  removeFromWishlist(wishlistId: string): void {
    const wishlist = localStorage.getItem(this.WISHLIST_KEY);
    if (!wishlist) return;
    
    const allWishlist = JSON.parse(wishlist);
    const filtered = allWishlist.filter((item: any) => item._id !== wishlistId);
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(filtered));
  }

  // Clear wishlist for user
  clearWishlist(userId: string): void {
    const wishlist = localStorage.getItem(this.WISHLIST_KEY);
    if (!wishlist) return;
    
    const allWishlist = JSON.parse(wishlist);
    const filtered = allWishlist.filter((item: any) => item.userId !== userId);
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(filtered));
  }
}
