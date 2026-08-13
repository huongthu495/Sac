import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackApiService {
  private apiUrl = "http://localhost:3000/feedback";

  constructor(private http: HttpClient) {}

  sendFeedback(data:any):Observable<any>{
    return this.http.post(this.apiUrl,data);
  }

  getFeedback(){
    return this.http.get(this.apiUrl);
  }

  deleteFeedback(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateFeedback(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}
