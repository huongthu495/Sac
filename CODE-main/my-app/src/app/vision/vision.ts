import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-vision',
  imports: [CommonModule],
  templateUrl: './vision.html',
  styleUrl: './vision.css',
})
export class Vision implements AfterViewInit, OnDestroy {
  @ViewChild('gallery') gallery!: ElementRef;

  private animFrameId: number | null = null;
  private angles: number[] = [];
  private isBrowser: boolean;
  private cardElements: HTMLElement[] = [];
  private cachedCardW = 200;
  private cachedCardH = 260;
  private cardResizeObserver: ResizeObserver | null = null;

  cards = [
    { image: '/assets/thy1.png', alt: 'Áo dài truyền thống' },
    { image: '/assets/xuananh1.jpg', alt: 'Áo dài truyền thống' },
    { image: '/assets/thy2.jpg', alt: 'Áo dài truyền thống' },
    { image: '/assets/thy3.jpg', alt: 'Áo dài truyền thống' },
    { image: '/assets/thy4.jpg', alt: 'Áo dài truyền thống' },
    { image: '/assets/thy5.jpg', alt: 'Áo dài truyền thống' },
    { image: '/assets/yhien1.png', alt: 'Áo dài truyền thống' },
    { image: '/assets/yhien2.png', alt: 'Áo dài truyền thống' },
    { image: '/assets/yhien3.png', alt: 'Áo dài truyền thống' },
    { image: '/assets/yhien4.png', alt: 'Áo dài truyền thống' },
  ];

  get allCards() {
    return [...this.cards, ...this.cards];
  }

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }


  ngAfterViewInit() {
    if (!this.isBrowser) return;
    // Đợi Angular render xong *ngFor rồi mới khởi tạo
    setTimeout(() => {
      this.initCircularGallery();
      this.setupCardResizeObserver();
    }, 200);
  }

  ngOnDestroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.cardResizeObserver) {
      this.cardResizeObserver.disconnect();
    }
  }
  // Tự động cập nhật lại orbit khi card bị resize (đổi CSS)
  private setupCardResizeObserver() {
    if (!this.isBrowser) return;
    const galleryEl = this.gallery?.nativeElement;
    if (!galleryEl) return;
    const firstCard = galleryEl.querySelector('.vision-card');
    if (!firstCard) return;
    if (this.cardResizeObserver) {
      this.cardResizeObserver.disconnect();
    }
    this.cardResizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === firstCard) {
          const cr = entry.contentRect;
          this.cachedCardW = cr.width;
          this.cachedCardH = cr.height;
          // Re-init orbit to update all positions
          this.initCircularGallery();
        }
      }
    });
    this.cardResizeObserver.observe(firstCard);
  }

  private initCircularGallery() {
    const galleryEl = this.gallery?.nativeElement;
    if (!galleryEl) return;

    // Cancel previous animation loop before starting new one
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.cardElements = Array.from(galleryEl.querySelectorAll('.vision-card')) as HTMLElement[];
    const totalCards = this.cardElements.length;
    if (totalCards === 0) return;

    // Cache card dimensions once to avoid layout thrashing
    const firstCard = this.cardElements[0];
    this.cachedCardW = firstCard.offsetWidth || 200;
    this.cachedCardH = firstCard.offsetHeight || 260;

    const radius = 1200;
    const centerX = (galleryEl.offsetWidth || window.innerWidth) / 2;
    const sectionH = galleryEl.offsetHeight || 700;
    const centerY = sectionH + radius - 550; // Đẩy tâm vòng tròn xuống dưới section

    this.angles = [];
    this.cardElements.forEach((_, i) => {
      this.angles.push((i / totalCards) * Math.PI * 2);
    });

    // Dùng requestAnimationFrame thay vì GSAP ticker để tránh vấn đề SSR
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.cardElements.forEach((card, i) => {
          this.angles[i] += 0.001;
          this.updateCard(card, this.angles[i], radius, centerX, centerY, i);
        });
        this.animFrameId = requestAnimationFrame(animate);
      };
      animate();
    });
  }

  private updateCard(
    card: HTMLElement, angle: number, radius: number,
    cx: number, cy: number, index: number
  ) {
    const x = cx + Math.cos(angle) * radius - this.cachedCardW / 2;
    const y = cy + Math.sin(angle) * radius - this.cachedCardH / 2;
    const rotation = (angle * 180 / Math.PI) + 90 + Math.sin(index) * 5;

    card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
  }
}
