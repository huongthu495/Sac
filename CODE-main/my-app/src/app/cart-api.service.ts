import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartApiService {
  private apiURL = 'http://localhost:3000/cart';
  private cartItems = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItems.asObservable();
  constructor(private http: HttpClient) {}
  getCart(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }
  getCartByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/user/${userId}`);
  }
  addToCart(product: any): Observable<any> {
    return this.http.post(this.apiURL, product);
  }
  updateQuantity(id: string, quantity: number): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, { quantity });
  }
  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
  clearCart(userId: string): Observable<any> {
    return this.http.delete(`${this.apiURL}/user/${userId}`);
  }
  loadCart(userId: string) {
    this.http.get<any[]>(`${this.apiURL}/user/${userId}`)
      .subscribe(data => this.cartItems.next(data));
  }
  refreshCart(userId: string) {
    this.loadCart(userId);
  }
}
