import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ProductCard } from '../services/chat.service';

interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date | string;
}

interface ChatHistoryData {
  messages: ChatHistoryMessage[];
}

interface ChatHistoryResponse {
  success: boolean;
  data?: ChatHistoryData;
}

interface ChatSendData {
  message: string;
  products?: ProductCard[];
}

interface ChatSendResponse {
  success: boolean;
  data?: ChatSendData;
}

interface ChatMessage {
  text: string;
  time: string;
  isBot: boolean;
  products?: ProductCard[];
}

@Component({
  selector: 'app-sac-bee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sac-bee.html',
  styleUrl: './sac-bee.css',
})
export class SacBee implements OnInit, OnDestroy, AfterViewChecked {
  isChatOpen: boolean = false;
  hasNewMessage: boolean = false;
  inputMessage: string = '';
  messages: ChatMessage[] = [];
  isLoading: boolean = false;

  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  private shouldScrollToBottom: boolean = false;
  private welcomeMessages: string[] = [
    'Xin chào! Tôi là Sac-bee, trợ lý ảo của Sắc. Tôi có thể giúp gì cho bạn?',
  ];

  constructor(
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Thêm tin nhắn chào mừng khi component khởi tạo
    this.addWelcomeMessages();
    this.isLoading = false;
    
    // Load chat history nếu có
    this.loadChatHistory();
  }

  /**
   * Load chat history từ API
   */
  private loadChatHistory(): void {
    const userId = this.getUserId();
    this.chatService.getHistory(userId).subscribe({
      next: (response: ChatHistoryResponse) => {
        if (response.success && response.data && response.data.messages && response.data.messages.length > 0) {
          // Convert API messages to component messages
          // Chỉ load các messages từ user và assistant (bỏ system messages)
          const userMessages = response.data.messages
            .filter((msg: ChatHistoryMessage) => msg.role === 'user' || msg.role === 'assistant')
            .map((msg: ChatHistoryMessage) => ({
              text: msg.content,
              time: this.formatTimeFromDate(msg.timestamp || new Date()),
              isBot: msg.role === 'assistant',
            }));

          // Chỉ thêm messages nếu có (không thêm welcome message nếu đã có history)
          if (userMessages.length > 0) {
            // Xóa welcome message nếu đã có history
            if (this.messages.length > 0 && this.messages[0].isBot) {
              this.messages = [];
            }
            this.messages.push(...userMessages);
            this.shouldScrollToBottom = true;
          }
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
        // Không block UI nếu lỗi load history
      },
    });
  }

  /**
   * Lấy userId từ localStorage
   */
  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.CustomerID || user._id || user.id;
      }
    } catch {
      // ignore
    }
    return undefined;
  }

  /**
   * Format time from Date object
   */
  private formatTimeFromDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  ngAfterViewChecked(): void {
    // Tự động scroll xuống cuối khi có tin nhắn mới
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    // Dọn dẹp nếu cần
  }

  toggleChat(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.isChatOpen = !this.isChatOpen;

    if (this.isChatOpen) {
      // Đánh dấu không còn tin nhắn mới khi mở chat
      this.hasNewMessage = false;

      // Tập trung vào ô nhập sau khi mở
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 300);
    }
  }

  closeChat(): void {
    this.isChatOpen = false;
  }

  sendMessage(): void {
    if (!this.inputMessage || !this.inputMessage.trim() || this.isLoading) {
      return;
    }

    // Lưu tin nhắn trước khi clear
    const messageText = this.inputMessage.trim();

    // Thêm tin nhắn của người dùng
    const userMessage: ChatMessage = {
      text: messageText,
      time: this.getCurrentTime(),
      isBot: false,
    };

    this.messages.push(userMessage);

    // Clear input ngay lập tức
    this.inputMessage = '';

    // Đảm bảo input được clear trong DOM
    if (this.messageInput) {
      this.messageInput.nativeElement.value = '';
    }

    this.shouldScrollToBottom = true;
    this.isLoading = true;

    // Lấy userId từ localStorage nếu có
    const userStr = localStorage.getItem('user');
    let userId: string | undefined;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user.CustomerID || user._id || user.id;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Gọi API để nhận phản hồi từ AI
    this.chatService.sendMessage(messageText, userId).subscribe({
      next: (response: ChatSendResponse) => {
        if (response.success && response.data) {
          const botMessage: ChatMessage = {
            text: response.data.message,
            time: this.getCurrentTime(),
            isBot: true,
            products: response.data.products || undefined, // Thêm danh sách sản phẩm nếu có
          };

          this.messages.push(botMessage);
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();

          // Đánh dấu có tin nhắn mới nếu chat đang đóng
          if (!this.isChatOpen) {
            this.hasNewMessage = true;
          }
        } else {
          // Fallback to local response nếu API lỗi
          this.handleBotResponseFallback(messageText);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        // Focus lại input sau khi nhận phản hồi
        setTimeout(() => {
          if (this.messageInput) {
            this.messageInput.nativeElement.focus();
          }
        }, 100);
      },
      error: (error: unknown) => {
        console.error('Error sending message:', error);
        // Fallback to local response
        this.handleBotResponseFallback(messageText);
        this.isLoading = false;
          this.cdr.detectChanges();
        // Focus lại input sau khi lỗi
        setTimeout(() => {
          if (this.messageInput) {
            this.messageInput.nativeElement.focus();
          }
        }, 100);
      },
    });
  }

  /**
   * Fallback response handler - Sử dụng khi API lỗi
   */
  private handleBotResponseFallback(userMessage: string): void {
    const lowerMessage = userMessage.toLowerCase();
    let botResponse: string = '';

    // Xử lý các câu hỏi phổ biến
    if (
      lowerMessage.includes('sản phẩm') ||
      lowerMessage.includes('product') ||
      lowerMessage.includes('bộ sưu tập') ||
      lowerMessage.includes('collection')
    ) {
      botResponse =
        'SẮC hiện có các dòng nổi bật như áo dài, Việt phục và phụ kiện lấy cảm hứng từ văn hóa Việt. Bạn có thể vào mục "Sản phẩm" để xem theo danh mục hoặc nhắn tên món bạn muốn để Sac-bee gợi ý nhanh hơn.';
    } else if (lowerMessage.includes('size') || lowerMessage.includes('kích cỡ')) {
      botResponse =
        'Để tư vấn size chính xác, bạn gửi giúp Sac-bee chiều cao, cân nặng và số đo cơ bản (nếu có). Sac-bee sẽ gợi ý size phù hợp theo phom dáng của từng thiết kế.';
    } else if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order')) {
      botResponse =
        'Bạn có thể kiểm tra đơn hàng trong mục tài khoản cá nhân. Nếu cần Sac-bee hỗ trợ nhanh, bạn vui lòng gửi mã đơn hoặc số điện thoại đặt hàng để đội ngũ CSKH kiểm tra giúp bạn.';
    } else if (
      lowerMessage.includes('hỗ trợ') ||
      lowerMessage.includes('support') ||
      lowerMessage.includes('help')
    ) {
      botResponse =
        'Sac-bee luôn sẵn sàng hỗ trợ bạn. Bạn có thể liên hệ SẮC qua:\n- Hotline: 0812 059 720\n- Email: sac.support@gmail.com\n- Hoặc để lại lời nhắn tại trang Liên hệ để được phản hồi sớm.';
    } else if (
      lowerMessage.includes('giá') ||
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost')
    ) {
      botResponse =
        'Giá của từng sản phẩm được hiển thị trực tiếp trên trang chi tiết. Nếu bạn muốn gợi ý theo ngân sách, hãy cho Sac-bee biết mức giá mong muốn để lọc nhanh cho bạn.';
    } else if (
      lowerMessage.includes('giao hàng') ||
      lowerMessage.includes('delivery') ||
      lowerMessage.includes('ship')
    ) {
      botResponse =
        'SẮC hỗ trợ giao hàng toàn quốc. Thời gian nhận hàng thường từ 1-3 ngày nội thành và 3-5 ngày với khu vực khác. Sac-bee có thể hỗ trợ bạn kiểm tra phí ship theo địa chỉ cụ thể.';
    } else if (
      lowerMessage.includes('đổi trả') ||
      lowerMessage.includes('return') ||
      lowerMessage.includes('refund')
    ) {
      botResponse =
        'SẮC hỗ trợ đổi trả theo chính sách hiện hành khi sản phẩm còn nguyên tình trạng và đáp ứng điều kiện đổi trả. Bạn có thể gửi mã đơn để Sac-bee hướng dẫn đúng quy trình nhanh nhất.';
    } else if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thank')) {
      botResponse =
        'Rất vui được hỗ trợ bạn. Nếu cần tư vấn thêm về sản phẩm hoặc size, Sac-bee luôn sẵn sàng!';
    } else if (
      lowerMessage.includes('xin chào') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi')
    ) {
      botResponse = 'Xin chào bạn, Sac-bee có thể hỗ trợ tư vấn sản phẩm, size, giao hàng hoặc đơn hàng ngay bây giờ.';
    } else {
      botResponse =
        'Cảm ơn bạn đã nhắn cho SẮC. Sac-bee đã ghi nhận nội dung: "' +
        userMessage +
        '".\n\nĐể Sac-bee hỗ trợ nhanh hơn, bạn có thể cung cấp thêm:\n- Tên sản phẩm hoặc danh mục quan tâm\n- Nhu cầu (tư vấn size / kiểm tra đơn / giao hàng)\n- Số điện thoại đặt hàng (nếu cần tra cứu đơn).';
    }

    const botMessage: ChatMessage = {
      text: botResponse,
      time: this.getCurrentTime(),
      isBot: true,
    };

    this.messages.push(botMessage);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    // Đánh dấu có tin nhắn mới nếu chat đang đóng
    if (!this.isChatOpen) {
      this.hasNewMessage = true;
    }
  }

  private addWelcomeMessages(): void {
    // Thêm tin nhắn chào mừng ban đầu
    const welcomeMessage: ChatMessage = {
      text: this.welcomeMessages[0],
      time: this.getCurrentTime(),
      isBot: true,
    };
    this.messages.push(welcomeMessage);
  }

  private scrollToBottom(): void {
    if (this.chatMessages) {
      const element = this.chatMessages.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatMessage(text: string): string {
    // Thay \n thành <br> để hiển thị xuống dòng đúng chỗ
    return text.replace(/\n/g, '<br>');
  }

  /**
   * Chuyển hướng sang trang chi tiết sản phẩm
   */
  goToProductDetail(product: ProductCard): void {
    if (product && product._id) {
      this.router.navigate(['/product', product._id]);
      // Đóng chat khi chuyển hướng
      this.closeChat();
    }
  }

  /**
   * Format giá tiền
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  resolveProductImage(image?: string): string {
    if (!image) {
      return '/assets/thy1.png';
    }

    if (/^(https?:)?\/\//.test(image) || image.startsWith('/assets/')) {
      return image;
    }

    const normalizedImage = image.replace(/^\/+/, '').replace(/^assets\//, '');

    return '/assets/' + normalizedImage;
  }

  onProductImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = '/assets/thy1.png';
    }
  }
}
