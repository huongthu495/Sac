import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

export interface BlogPost {
  id: string;
  img: string;
  title: string;
  excerpt: string;
  pubDate: string | Date;
  author: string;
  categoryTag: string;
  content: string;
  status?: string;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class BlogApiService {
  private apiUrl = 'http://localhost:3000/blogs';
  constructor(private http: HttpClient) {}

  getBlogs(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
    getBlogById(id: string): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/${id}`);
    }
}
