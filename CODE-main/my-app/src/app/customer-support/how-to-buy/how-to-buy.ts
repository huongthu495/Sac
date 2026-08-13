import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FeedbackApiService } from '../../feedback-api.service';

interface SupportItem {
  id: number;
  icon: string;
  iconPath: string;
  title: string;
  content: string;
  isExpanded: boolean;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isExpanded: boolean;
}

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

@Component({
  selector: 'app-how-to-buy',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './how-to-buy.html',
  styleUrl: './how-to-buy.css',
})
export class HowToBuy implements OnInit {
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';
  isSubmitting = false;
  skipAnimation = false;

  faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Tôi có thể hủy đơn hàng sau khi đặt không?',
      answer:
        'Bạn có thể hủy đơn hàng trong thời gian chờ xác nhận. Sau thời gian này, đơn hàng đã được xử lý và không thể hủy.',
      isExpanded: false,
    },
    {
      id: 2,
      question: 'Thời gian giao hàng của Sắc là bao lâu?',
      answer:
        'Chúng tôi luôn cố gắng giao hàng nhanh nhất để sản phẩm đến tay bạn chỉn chu nhất:<br><br><strong>• Nội thành HN/HCM:</strong> 2 - 4 giờ<br><strong>• Ngoại thành:</strong> 24 - 48 giờ<br><strong>• Các tỉnh khác:</strong> 2 - 5 ngày làm việc',
      isExpanded: false,
    },
    {
      id: 3,
      question: 'Nếu sản phẩm có vấn đề thì sao?',
      answer:
        'Sắc cam kết chất lượng sản phẩm. Nếu có lỗi, vui lòng chụp ảnh/video và liên hệ hotline <strong>0812 059 720</strong> hoặc email <strong>sac.support@gmail.com</strong> để được hỗ trợ đổi trả.',
      isExpanded: false,
    },
    {
      id: 4,
      question: 'Phí vận chuyển được tính như thế nào?',
      answer:
        'Phí ship được tính theo khu vực và giá trị đơn hàng:<br><br><strong>• Miễn phí ship:</strong> Đơn từ 400.000₫ (nội thành)<br><strong>• Nội thành:</strong> 25.000₫ (đơn dưới 400.000₫)<br><strong>• Ngoại thành:</strong> 35.000₫',
      isExpanded: false,
    },
  ];

  supportItems: SupportItem[] = [
    {
      id: 1,
      icon: 'faq',
      iconPath: '/assets/support_dark.png',
      title: 'Câu hỏi thường gặp',
      content: '',
      isExpanded: false,
    },
    {
      id: 2,
      icon: 'guide',
      iconPath: '/assets/add_to_cart.png',
      title: 'Hướng dẫn đặt hàng',
      content: `
        <div class="order-guide">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Chọn sản phẩm yêu thích</h4>
              <p>Duyệt qua danh mục sản phẩm và thêm sản phẩm vào giỏ hàng.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Kiểm tra giỏ hàng</h4>
              <p>Rà soát số lượng, giá và áp dụng mã giảm giá nếu có.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Điền thông tin nhận hàng</h4>
              <p>Nhập địa chỉ, số điện thoại và chọn phương thức thanh toán phù hợp.</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Theo dõi đơn hàng</h4>
              <p>Nhận mã đơn và theo dõi trạng thái giao hàng trong tài khoản.</p>
            </div>
          </div>
        </div>
      `,
      isExpanded: false,
    },
    {
      id: 3,
      icon: 'return',
      iconPath: '/assets/exchange_dark.png',
      title: 'Hướng dẫn đổi trả hàng',
      content: `
        <h4>Điều kiện đổi trả</h4>
        <ul>
          <li>Đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.</li>
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng.</li>
          <li>Có đầy đủ hóa đơn và bao bì gốc khi gửi lại.</li>
        </ul>

        <h4>Cách gửi yêu cầu đổi trả</h4>
        <ol>
          <li>Chụp ảnh/quay video sản phẩm cần đổi trả.</li>
          <li>Liên hệ hotline <strong>0812 059 720</strong> hoặc email <strong>sac.support@gmail.com</strong>.</li>
          <li>Nhân viên xác nhận và hướng dẫn đóng gói gửi hàng.</li>
        </ol>

        <h4>Thời gian xử lý</h4>
        <p>Yêu cầu sẽ được xác nhận trong vòng 24 giờ làm việc. Hoàn tiền/đổi sản phẩm từ 3-5 ngày làm việc sau khi nhận lại hàng.</p>
      `,
      isExpanded: false,
    },
  ];

  contactData: ContactForm = {
    name: '',
    email: '',
    message: '',
  };

  constructor(
    private http: HttpClient,
    private feedbackApi: FeedbackApiService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const openSection = params['open'];
      if (openSection) {
        this.skipAnimation = true;
        this.openSpecificSection(openSection);
      } else if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  openSpecificSection(sectionType: string): void {
    const sectionMap: { [key: string]: number } = {
      faq: 1,
      order: 2,
      return: 3,
    };

    const sectionId = sectionMap[sectionType];
    if (sectionId) {
      this.supportItems.forEach((s) => (s.isExpanded = false));
      const section = this.supportItems.find((s) => s.id === sectionId);
      if (section) {
        section.isExpanded = true;
        this.scrollToSection(section.id);
      }
    }
  }

  private scrollToSection(sectionId: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Use scrollIntoView — works correctly with scroll-margin-top set in CSS
    setTimeout(() => {
      const sectionEl = document.getElementById(`support-tab-${sectionId}`);
      sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  toggleAccordion(supportId: number): void {
    const support = this.supportItems.find((s) => s.id === supportId);
    if (support) {
      support.isExpanded = !support.isExpanded;
    }
  }

  toggleFAQ(faqId: number): void {
    const faq = this.faqItems.find((f) => f.id === faqId);
    if (faq) {
      faq.isExpanded = !faq.isExpanded;
    }
  }

  onSubmit(): void {
    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
      this.showPopupMessage('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactData.email)) {
      this.showPopupMessage('Email không hợp lệ', 'error');
      return;
    }

    this.isSubmitting = true;

    this.feedbackApi
      .sendFeedback({
        name: this.contactData.name,
        email: this.contactData.email,
        message: this.contactData.message,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.showPopupMessage(
            'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
            'success'
          );
          this.contactData = { name: '', email: '', message: '' };
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage =
            error?.error?.message || 'Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.';
          this.showPopupMessage(errorMessage, 'error');
        },
      });
  }

  showPopupMessage(message: string, type: 'success' | 'error'): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;

    const timeout = type === 'success' ? 5000 : 7000;
    setTimeout(() => {
      this.closePopup();
    }, timeout);
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupMessage = '';
  }
}
