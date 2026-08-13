import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthPopupService {
  private popupSubject = new Subject<string>();
  popup$ = this.popupSubject.asObservable();

  openPopup(type: string): void {
    this.popupSubject.next(type);
  }

  closePopup(): void {
    this.popupSubject.next('');
  }
}
