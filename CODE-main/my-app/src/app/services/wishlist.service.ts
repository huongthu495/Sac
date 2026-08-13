import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  isInWishlist(customerID: string, sku: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/wishlist/${customerID}`).pipe(
      map((res: any) => {
        const items = Array.isArray(res) ? res : res?.data || [];
        return items.some((item: any) => item.sku === sku || item.productSku === sku);
      }),
      catchError(() => of(false))
    );
  }

  addToWishlist(customerID: string, sku: string, productName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wishlist`, { customerID, sku, productName });
  }

  removeFromWishlist(customerID: string, sku: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wishlist/${customerID}/${sku}`);
  }
}
