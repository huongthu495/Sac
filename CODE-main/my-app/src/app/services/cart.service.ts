import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface CartItem {
  _id?: string;
  userId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderRequest {
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

interface OrderRequestV2 extends OrderRequest {
  paymentMethod?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000';
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();
  
  // BehaviorSubject cho số lượng sản phẩm trong giỏ
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();
  
  private currentUserId = '1'; // In production, get from auth service
  private localStorageKey = 'guest_cart_v1';

  constructor(private http: HttpClient) {
    // initialize user from localStorage if available
    this.syncUserFromStorage();
    // listen for storage changes (login/logout in other tabs)
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === 'user') {
          this.syncUserFromStorage();
          this.loadCartFromAPI();
        }
      });
    }

    this.loadCartFromAPI();
  }

  private syncUserFromStorage() {
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const user = JSON.parse(userRaw);
        this.currentUserId = user._id || user.id || this.currentUserId;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  private isLoggedIn(): boolean {
    return !!this.currentUserId && this.currentUserId !== '1' && this.currentUserId !== '';
  }

  // Load cart from backend
  loadCartFromAPI(): void {
    if (this.isLoggedIn()) {
      this.getUserCart().subscribe({
        next: (items) => {
          this.cartSubject.next(items);
          this.updateCartCount(items);
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.cartSubject.next([]);
          this.updateCartCount([]);
        }
      });
    } else {
      // load from localStorage for guest
      try {
        const raw = localStorage.getItem(this.localStorageKey);
        const items = raw ? JSON.parse(raw) : [];
        this.cartSubject.next(items);
        this.updateCartCount(items);
      } catch (e) {
        this.cartSubject.next([]);
        this.updateCartCount([]);
      }
    }
  }

  // Update cart count
  private updateCartCount(items: CartItem[]): void {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  // Get cart items for current user
  getUserCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/cart/user/${this.currentUserId}`);
  }

  // Add item to cart
  addToCart(item: { name: string; price: number; image: string; quantity?: number }): Observable<CartItem> {
    const cartItem = {
      userId: this.currentUserId,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      image: item.image
    };

    if (this.isLoggedIn()) {
      return this.http.post<CartItem>(`${this.apiUrl}/cart`, cartItem).pipe(
        tap(() => this.loadCartFromAPI()) // Reload cart after adding
      );
    } else {
      // guest: save to localStorage and update subject
      try {
        const raw = localStorage.getItem(this.localStorageKey);
        const items: CartItem[] = raw ? JSON.parse(raw) : [];
        const newItem: any = { ...cartItem, _id: 'g_' + Date.now() };
        items.push(newItem);
        localStorage.setItem(this.localStorageKey, JSON.stringify(items));
        this.cartSubject.next(items);
        this.updateCartCount(items);
        return new Observable<CartItem>(observer => {
          observer.next(newItem as CartItem);
          observer.complete();
        });
      } catch (e) {
        return new Observable<CartItem>(observer => observer.error(e));
      }
    }
  }

  // Update cart item quantity
  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    if (this.isLoggedIn()) {
      return this.http.put<CartItem>(`${this.apiUrl}/cart/${itemId}`, { quantity }).pipe(
        tap(() => this.loadCartFromAPI()) // Reload cart after updating
      );
    } else {
      // update localStorage
      try {
        const raw = localStorage.getItem(this.localStorageKey);
        const items: CartItem[] = raw ? JSON.parse(raw) : [];
        const idx = items.findIndex(i => i._id === itemId);
        if (idx >= 0) {
          items[idx].quantity = quantity;
          localStorage.setItem(this.localStorageKey, JSON.stringify(items));
          this.cartSubject.next(items);
          this.updateCartCount(items);
        }
        return new Observable<CartItem>(observer => {
          observer.next(items[idx] as CartItem);
          observer.complete();
        });
      } catch (e) {
        return new Observable<CartItem>(observer => observer.error(e));
      }
    }
  }

  // Remove item from cart
  removeFromCart(itemId: string): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.delete(`${this.apiUrl}/cart/${itemId}`).pipe(
        tap(() => this.loadCartFromAPI()) // Reload cart after removing
      );
    } else {
      try {
        const raw = localStorage.getItem(this.localStorageKey);
        const items: CartItem[] = raw ? JSON.parse(raw) : [];
        const newItems = items.filter(i => i._id !== itemId);
        localStorage.setItem(this.localStorageKey, JSON.stringify(newItems));
        this.cartSubject.next(newItems);
        this.updateCartCount(newItems);
        return new Observable(observer => { observer.next({}); observer.complete(); });
      } catch (e) {
        return new Observable((observer) => observer.error(e));
      }
    }
  }

  // Clear entire cart
  clearCart(): Observable<any> {
    if (this.isLoggedIn()) {
      return this.http.delete(`${this.apiUrl}/cart/user/${this.currentUserId}`).pipe(
        tap(() => {
          this.cartSubject.next([]);
          this.cartCountSubject.next(0);
        })
      );
    } else {
      try {
        localStorage.removeItem(this.localStorageKey);
        this.cartSubject.next([]);
        this.cartCountSubject.next(0);
        return new Observable(observer => { observer.next({}); observer.complete(); });
      } catch (e) {
        return new Observable(observer => observer.error(e));
      }
    }
  }

  // Create order from cart
  createOrderFromCart(customerInfo: { name: string; email: string; phone: string; address: string, paymentMethod?: string }, paymentMethod?: string): Observable<any> {
    const orderRequest: OrderRequestV2 = {
      userId: this.currentUserId,
      customerInfo: customerInfo,
      paymentMethod: paymentMethod
    };
    if (this.isLoggedIn()) {
      return this.http.post(`${this.apiUrl}/order/from-cart`, orderRequest).pipe(
        tap(() => {
          this.cartSubject.next([]);
          this.cartCountSubject.next(0);
        })
      );
    } else {
      // For guest orders, emulate order creation and clear local cart
      try {
        // In a real app you'd POST to a guest order endpoint
        localStorage.removeItem(this.localStorageKey);
        this.cartSubject.next([]);
        this.cartCountSubject.next(0);
        return new Observable(observer => { observer.next({ ok: true }); observer.complete(); });
      } catch (e) {
        return new Observable(observer => observer.error(e));
      }
    }
  }

  // Get cart count
  getCartCount(): Observable<number> {
    return this.cartCount$;
  }

  // Get cart total
  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(items => items.reduce((total, item) => total + (item.price * item.quantity), 0))
    );
  }
}