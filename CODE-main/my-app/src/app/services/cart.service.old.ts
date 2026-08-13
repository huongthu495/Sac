import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:3000';
  
  // BehaviorSubject để theo dõi thay đổi giỏ hàng
  private cartSubject = new BehaviorSubject<any[]>([]);
  public cart$ = this.cartSubject.asObservable();
  
  // BehaviorSubject cho số lượng sản phẩm trong giỏ
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartFromAPI();
  }

  // Lấy thông tin user hiện tại
  private getCurrentUser() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    const userRaw = localStorage.getItem('user');
    return userRaw ? JSON.parse(userRaw) : null;
  }

  // Lấy giỏ hàng từ API
  loadCartFromAPI(): void {
    const user = this.getCurrentUser();
    if (!user || !user._id) {
      console.log('No user found, using empty cart');
      this.updateCartSubjects([]);
      return;
    }

    this.http.get<any[]>(`${this.apiUrl}/cart/${user._id}`).pipe(
      tap(cartData => {
        console.log('Loaded cart from API:', cartData);
        this.updateCartSubjects(cartData || []);
      }),
      catchError(err => {
        console.error('Error loading cart from API:', err);
        this.updateCartSubjects([]);
        return of([]);
      })
    ).subscribe();
  }

  // Cập nhật subjects
  private updateCartSubjects(cartData: any[]): void {
    this.cartSubject.next(cartData);
    const totalCount = cartData.reduce((total, item) => total + (item.quantity || 0), 0);
    this.cartCountSubject.next(totalCount);
  }

  // Thêm sản phẩm vào giỏ hàng (backend API)
  addToCart(product: any, quantity: number = 1, selectedSize?: string): Observable<any> {
    const user = this.getCurrentUser();
    if (!user || !user._id) {
      console.error('No user found for adding to cart');
      return of(null);
    }

    const cartItem = {
      userId: user._id,
      productId: product._id,
      name: product.product_name || product.name,
      price: product.unit_price || product.price,
      image: product.imageUrl || product.image,
      quantity,
      selectedSize
    };

    console.log('Adding to cart via API:', cartItem);
    
    return this.http.post(`${this.apiUrl}/cart/add`, cartItem).pipe(
      tap(() => {
        console.log('Added to cart successfully, reloading cart data');
        this.loadCartFromAPI(); // Reload giỏ hàng sau khi thêm
      }),
      catchError(err => {
        console.error('Error adding to cart:', err);
        throw err;
      })
    );
  }

  // Cập nhật số lượng sản phẩm
  updateQuantity(cartItemId: string, quantity: number): Observable<any> {
    console.log('Updating cart item quantity:', cartItemId, quantity);
    
    return this.http.put(`${this.apiUrl}/cart/update/${cartItemId}`, { quantity }).pipe(
      tap(() => {
        console.log('Updated quantity successfully, reloading cart data');
        this.loadCartFromAPI(); // Reload giỏ hàng sau khi cập nhật
      }),
      catchError(err => {
        console.error('Error updating cart quantity:', err);
        throw err;
      })
    );
  }

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart(cartItemId: string): Observable<any> {
    console.log('Removing cart item:', cartItemId);
    
    return this.http.delete(`${this.apiUrl}/cart/remove/${cartItemId}`).pipe(
      tap(() => {
        console.log('Removed from cart successfully, reloading cart data');
        this.loadCartFromAPI(); // Reload giỏ hàng sau khi xóa
      }),
      catchError(err => {
        console.error('Error removing from cart:', err);
        throw err;
      })
    );
  }

  // Xóa toàn bộ giỏ hàng
  clearCart(): Observable<any> {
    const user = this.getCurrentUser();
    if (!user || !user._id) {
      return of(null);
    }
    
    console.log('Clearing cart for user:', user._id);
    
    return this.http.delete(`${this.apiUrl}/cart/clear/${user._id}`).pipe(
      tap(() => {
        console.log('Cart cleared successfully, reloading cart data');
        this.loadCartFromAPI(); // Reload giỏ hàng sau khi xóa
      }),
      catchError(err => {
        console.error('Error clearing cart:', err);
        throw err;
      })
    );
  }

  // Lấy giỏ hàng hiện tại
  getCurrentCart(): any[] {
    return this.cartSubject.value;
  }

  // Tính tổng tiền giỏ hàng
  calculateTotal(): number {
    const cart = this.getCurrentCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Tạo đơn hàng từ giỏ hàng
  createOrderFromCart(orderData: any): Observable<any> {
    const user = this.getCurrentUser();
    if (!user || !user._id) {
      console.error('No user found for creating order');
      return of(null);
    }

    const orderPayload = {
      ...orderData,
      userId: user._id,
      cartItems: this.getCurrentCart(),
      total: this.calculateTotal(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    console.log('Creating order from cart:', orderPayload);

    return this.http.post(`${this.apiUrl}/orders`, orderPayload).pipe(
      tap(() => {
        console.log('Order created successfully, clearing cart');
        this.clearCart().subscribe(); // Xóa giỏ hàng sau khi tạo đơn
      }),
      catchError(err => {
        console.error('Error creating order:', err);
        throw err;
      })
    );
  }

  // Legacy method for backward compatibility
  async checkStockBeforeAdd(cartItem: any, quantity: number, stock: number | undefined, isBuyNow: boolean): Promise<boolean> {
    if (stock !== undefined && stock !== null && quantity > stock) {
      return false;
    }
    return true;
  }
}
