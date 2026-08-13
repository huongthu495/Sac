import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Vision } from '../vision/vision';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, Vision],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  latestBlogs: any[] = [];
  slides = [
    { image: '/assets/slide-1.png' },
    { image: '/assets/slide-2.png' },
    { image: '/assets/slide-3.png' },
    { image: '/assets/slide-4.png' },
    { image: '/assets/slide-5.png' },
  ];

  testimonials = [
    {
      name: 'Minh Chau',
      role: 'Khách hàng thân thiết',
      text: 'Đường may tinh tế, không một sợi chỉ thừa. Đáng đồng tiền bát gạo thực sự.',
    },
    {
      name: 'Ngoc Han',
      role: 'Nhân viên văn phòng',
      text: 'Vải gấm cao cấp, mặc cả ngày vẫn thấy thoải mái, không bị bí. Rất hài lòng với sự chuyên nghiệp và đúng tiến độ của tiệm.',
    },
    {
      name: 'Tom and Jerry',
      role: 'Tourist from UK',
      text: 'A must-try experience in Vietnam! I bought a Nhat Binh dress and the quality is outstanding. The staff explained the history behind the patterns, which I loved.',
    },
    {
      name: 'Thanh Dat',
      role: 'Nhà sáng tạo nội dung',
      text: 'Lần đầu thử mặc Việt Phục mà mê luôn. Cảm ơn shop đã giúp mình thêm yêu văn hóa nước nhà!',
    },
    {
      name: 'Linh Chi',
      role: 'Học sinh - Sinh viên',
      text: 'Đồ của shop rất hợp túi tiền sinh viên tụi mình. Mình mua bộ Ngũ Thân đi chụp kỷ yếu mà ai cũng khen lạ và xinh.',
    },
    {
      name: 'Quoc Viet',
      role: 'Khách mua làm quà tặng',
      text: 'Dịch vụ đóng gói cẩn thận, giao hàng đúng hẹn. Món quà rất tinh tế và người nhận rất yêu thích.',
    },
  ];

  currentSlide = 0;
  currentTestimonialPage = 0;
  cardsPerView = 3;
  private intervalId: any;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.updateCardsPerView();
    this.startAutoPlay();
    this.loadLatestBlogs();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCardsPerView();
  }

  get testimonialPages() {
    const pages = [];

    for (let index = 0; index < this.testimonials.length; index += this.cardsPerView) {
      pages.push(this.testimonials.slice(index, index + this.cardsPerView));
    }

    return pages;
  }

  // Bắt đầu tự động chạy
  startAutoPlay() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 4000); // 4 giây chuyển 1 lần
  }

  // Dừng tự động chạy (để tránh rác bộ nhớ)
  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Chuyển đến slide tiếp theo
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  // Quay lại slide trước
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  // Nhảy đến slide cụ thể khi click vào dấu chấm
  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetTimer();
  }

  // Reset lại timer: Khi người dùng tự bấm nút, timer sẽ tính lại từ đầu 4s 
  // để tránh trường hợp vừa bấm xong thì banner tự nhảy ngay lập tức.
  resetTimer() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  nextTestimonials() {
    this.currentTestimonialPage = (this.currentTestimonialPage + 1) % this.testimonialPages.length;
  }

  prevTestimonials() {
    this.currentTestimonialPage =
      (this.currentTestimonialPage - 1 + this.testimonialPages.length) % this.testimonialPages.length;
  }

  goToTestimonialsPage(index: number) {
    this.currentTestimonialPage = index;
  }

  private updateCardsPerView() {
    if (typeof window === 'undefined') {
      this.cardsPerView = 3;
      this.currentTestimonialPage = 0;
      return;
    }

    if (window.innerWidth <= 640) {
      this.cardsPerView = 1;
    } else if (window.innerWidth <= 1024) {
      this.cardsPerView = 2;
    } else {
      this.cardsPerView = 3;
    }

    if (this.currentTestimonialPage >= this.testimonialPages.length) {
      this.currentTestimonialPage = 0;
    }
  }

  loadLatestBlogs() {
    this.http.get<any>('http://localhost:3000/blogs').subscribe({
      next: (res) => {
        const blogs = Array.isArray(res) ? res : (res?.data || []);
        this.latestBlogs = blogs
          .filter((b: any) => b.status === 'published')
          .sort((a: any, b: any) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
          .slice(0, 3);
      },
      error: () => {
        this.latestBlogs = [];
      }
    });
  }

  goToBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }

  formatBlogDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}