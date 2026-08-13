import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ProductCard {
  _id: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
}

interface ChatMessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatHistoryResponse {
  success: boolean;
  data?: {
    messages: ChatMessageHistory[];
  };
}

interface ChatSendResponse {
  success: boolean;
  data?: {
    message: string;
    products?: ProductCard[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiURL = 'http://localhost:3001/chat';

  constructor(private http: HttpClient) {}

  getHistory(userId?: string): Observable<ChatHistoryResponse> {
    if (!userId) {
      return of({ success: true, data: { messages: [] } });
    }

    return this.http
      .get<ChatHistoryResponse>(`${this.apiURL}/history`, {
        params: { userId }
      })
      .pipe(catchError(() => of({ success: false, data: { messages: [] } })));
  }

  sendMessage(message: string, userId?: string): Observable<ChatSendResponse> {
    return this.http
      .post<ChatSendResponse>(`${this.apiURL}/message`, {
        message,
        userId
      })
      .pipe(catchError(() => of({ success: false })));
  }
}