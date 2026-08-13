import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Account } from '../app/models/Account'; 

@Injectable({
  providedIn: 'root',
})
export class UserApiService {

  private api = "http://localhost:3000/users";

  // ✅ State quản lý user
  private currentUser = new BehaviorSubject<Account | null>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {}

  // =========================
  // AUTH
  // =========================

  // đăng ký
  register(data: Account) {
    return this.http.post<Account>(this.api, data);
  }

  // login
  login(data: any) {
    return this.http.post<any>(this.api + "/login", data).pipe(
      tap((res: any) => {
        // server trả về user object trực tiếp (không bọc trong {user: ...})
        if (res?._id) {
          this.setUser(res);
        }
      })
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, {
      token,
      newPassword,
    });
  }

  // logout
  logout() {
    this.currentUser.next(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  // =========================
  // USER API
  // =========================

  // lấy user theo id
  getUser(id: string) {
    return this.http.get<Account>(`${this.api}/${id}`);
  }

  // update user
  updateUser(id: string, data: Account) {
    return this.http.put<Account>(`${this.api}/${id}`, data).pipe(
      tap((updated) => {
        this.setUser(updated);
      })
    );
  }

  // lấy user hiện tại (nếu có /me)
  getCurrentUser() {
    return this.http.get<Account>(this.api + "/me");
  }

  // load user từ backend
  loadCurrentUser() {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.setUser(user);
      },
      error: () => {
        this.currentUser.next(null);
      }
    });
  }

  setUser(user: Account) {
    this.currentUser.next(user);

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // fallback load từ local (khi reload trang)
  loadUserFromLocal() {
    if (typeof window === 'undefined') return;

    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;

    try {
      const user = JSON.parse(userRaw);
      this.currentUser.next(user);
    } catch {
      this.currentUser.next(null);
    }
  }

  getUsers() {
    return this.http.get<Account[]>(this.api);
  }

  addUser(data: Account) {
    return this.http.post<Account>(this.api, data);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}