import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackApiService } from '../feedback-api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  constructor(private FeedbackApiService : FeedbackApiService) { }

  onSubmit(event: Event): void {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const fullName = (form.elements.namedItem('firstName') as HTMLInputElement)?.value;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value;

    const data = {
      fullName: fullName,
      email: email,
      phone: phone,
      message: message
    };
    console.log("DATA SEND:", data);

    this.FeedbackApiService.sendFeedback(data).subscribe({
      next: (res) => {
        console.log("SUCCESS:", res);
        alert('Cảm ơn bạn đã gửi phản hồi!');
        form.reset();
      },
      error: (err) => {
        console.error("ERROR:", err);
        alert('Gửi phản hồi thất bại. Vui lòng thử lại.');
      }
    });
  }
}