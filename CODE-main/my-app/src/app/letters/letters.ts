import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-letters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './letters.html',
  styleUrl: './letters.css',
})
export class LettersComponent implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const elements = document.querySelectorAll(
      '.animate-left, .animate-right, .animate-up'
    );
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px',
      }
    );
    elements.forEach((el) => {
      el.classList.add('observed');
      this.observer!.observe(el);
    });
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }
}
