import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private base = '/api/admin';
  // backend server (matches my-server)
  private backend = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUserCount(): Observable<{ count: number }> {
    // use aggregated stats endpoint
    return this.http.get<{ users: number }>(`${this.backend}/api/admin/stats`).pipe(
      map(s => ({ count: (s?.users as number) || 0 }))
    );
  }

  getOrderCount(): Observable<{ count: number }> {
    return this.http.get<{ orders: number }>(`${this.backend}/api/admin/stats`).pipe(
      map(s => ({ count: (s?.orders as number) || 0 }))
    );
  }

  getProductCount(): Observable<{ count: number }> {
    return this.http.get<{ products: number }>(`${this.backend}/api/admin/stats`).pipe(
      map(s => ({ count: (s?.products as number) || 0 }))
    );
  }

  getRevenue(): Observable<{ revenue: number }> {
    return this.http.get<{ revenue: number }>(`${this.backend}/api/admin/stats`).pipe(
      map(s => ({ revenue: (s?.revenue as number) || 0 }))
    );
  }

  getActivities(): Observable<Array<any>> {
    // derive simple activities from recent orders (most recent actions)
    return this.http.get<any[]>(`${this.backend}/orders`).pipe(
      map(list => (Array.isArray(list) ? list.slice(0, 6).map(o => ({
        timestamp: o.createdAt || o.created_at || new Date(o._id ? parseInt(o._id.substring(0,8),16)*1000 : Date.now()),
        description: `Order ${o._id || o.id || ''} status: ${o.status || '—'}`
      })) : []))
    );
  }

  getRecentOrders(): Observable<Array<any>> {
    // reuse /orders endpoint and return most recent 8
    return this.http.get<any[]>(`${this.backend}/orders`).pipe(
      map(list => Array.isArray(list) ? list.slice(0, 8) : [])
    );
  }
}
