import { CommonModule, isPlatformBrowser } from '@angular/common'; // 1. Thêm isPlatformBrowser
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core'; // 2. Thêm Inject, PLATFORM_ID
import { RouterModule, ActivatedRoute } from '@angular/router';

interface PolicyItem {
  id: number;
  icon: string;
  iconPath: string;
  title: string;
  content: string;
  isExpanded: boolean;
}

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy.html',
  styleUrls: ['./policy.css']
})
export class Policy implements OnInit {
  
  policies: PolicyItem[] = [
    {
      id: 1,
      icon: 'return',
      iconPath: '/assets/exchange_dark.png',
      title: 'Chính sách đổi trả',
      content: `
        <h4>Thời gian đổi trả</h4>
        <p>Chúng tôi chấp nhận đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và có đầy đủ hóa đơn, bao bì.</p>
        
        <h4>Điều kiện đổi trả sản phẩm</h4>
        <p>Thời gian đổi trả là <strong>03 - 05 ngày</strong> kể từ ngày nhận hàng thành công (tùy khu vực).</p>
        <ul>
          <li>Sản phẩm không bị hư hại, rách, loang màu do tác động ngoại lực từ phía khách hàng.</li>
          <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng, chưa giặt là và không có mùi lạ (nước hoa, cơ thể).</li>
          <li>Giao sai mẫu mã, sai kích thước (size) hoặc sản phẩm có lỗi kỹ thuật (đường may, lỗi vải) được xác nhận ngay khi mở hàng.</li>
        </ul>
        
        <h4>Quy trình đổi trả</h4>
        <ol>
          <li>Chụp ảnh/quay video sản phẩm cần đổi trả</li>
          <li>Liên hệ hotline <strong>0812 059 720</strong> hoặc email <strong> sac.support@gmail.com</strong></li>
          <li>Đóng gói sản phẩm và chờ nhân viên đến lấy hàng</li>
          <li>Nhận sản phẩm mới hoặc hoàn tiền trong vòng 3-5 ngày làm việc</li>
        </ol>
        
        <p class="note"> <strong>Lưu ý:</strong> Chi phí vận chuyển đổi trả do cửa hàng chịu trong trường hợp lỗi từ phía chúng tôi.</p>
      `,
      isExpanded: false
    },
    {
      id: 2,
      icon: 'shop',
      iconPath: '/assets/pay_dark.png',
      title: 'Chính sách thanh toán',
      content: `
        <h4>Các hình thức thanh toán được hỗ trợ</h4>
        <p>Sắc hỗ trợ đa dạng phương thức thanh toán để thuận tiện cho khách hàng:</p>
        
        <ul>
          <li><strong>Thanh toán khi nhận hàng (COD):</strong> Thanh toán trực tiếp cho nhân viên giao hàng. Phí COD: 15.000₫/đơn (miễn phí cho đơn từ 400.000₫)</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> Chuyển khoản trực tiếp vào tài khoản Sắc</li>
          <li><strong>Ví điện tử:</strong> Momo, ZaloPay, VNPay, ShopeePay</li>
          <li><strong>Thẻ tín dụng/ghi nợ:</strong> Visa, Mastercard, JCB (qua cổng thanh toán OnePay)</li>
        </ul>
        
        <h4>Bảo mật thanh toán</h4>
        <p>Tất cả giao dịch thanh toán trực tuyến đều được mã hóa <strong>SSL 256-bit</strong> và xử lý qua cổng thanh toán uy tín đã được cấp phép. Chúng tôi không lưu trữ thông tin thẻ của khách hàng.</p>
        
        <h4>Chính sách hoàn tiền</h4>
        <p>Trường hợp hủy đơn hoặc đổi trả sản phẩm, tiền sẽ được hoàn lại trong vòng <strong>5-7 ngày làm việc</strong> (tùy phương thức thanh toán).</p>
      `,
      isExpanded: false
    },
    {
      id: 3,
      icon: 'protect',
      iconPath: '/assets/protect.png',
      title: 'Chính sách bảo mật',
      content: `
        <h4>Cam kết bảo mật thông tin</h4>
        <p>Sắc cam kết bảo vệ thông tin cá nhân của khách hàng theo <strong>Luật An toàn thông tin mạng</strong> và <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân.</p>
        
        <h4>Thông tin chúng tôi thu thập</h4>
        <ul>
          <li>Họ tên, số điện thoại, địa chỉ email</li>
          <li>Địa chỉ giao hàng</li>
          <li>Lịch sử mua hàng và tương tác với website</li>
        </ul>
        
        <h4>Mục đích sử dụng thông tin</h4>
        <ul>
          <li>Xử lý và giao hàng đơn hàng</li>
          <li>Tư vấn và chăm sóc khách hàng</li>
          <li>Gửi thông tin khuyến mãi (nếu khách hàng đồng ý)</li>
          <li>Cải thiện trải nghiệm người dùng</li>
        </ul>
        
        <h4>Bảo vệ dữ liệu</h4>
        <p>Chúng tôi sử dụng các biện pháp kỹ thuật tiên tiến:</p>
        <ul>
          <li>Mã hóa dữ liệu SSL/TLS</li>
          <li>Tường lửa và hệ thống phát hiện xâm nhập</li>
          <li>Sao lưu dữ liệu thường xuyên</li>
          <li>Kiểm soát quyền truy cập nghiêm ngặt</li>
        </ul>
        
        <p class="note">Chúng tôi <strong>KHÔNG BAO GIỜ</strong> chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý.</p>
      `,
      isExpanded: false
    },
    {
      id: 4,
      icon: 'logistic',
      iconPath: '/assets/logistic_dark.png',
      title: 'Chính sách giao hàng',
      content: `
        <h4>Khu vực giao hàng</h4>
        <p>Sắc hiện giao hàng trên toàn quốc <strong>63 tỉnh thành</strong> với hơn 200 điểm giao nhận.</p>
        
        <h4>Thời gian giao hàng</h4>
        <table class="shipping-table">
          <tr>
            <th>Khu vực</th>
            <th>Thời gian</th>
            <th>Ghi chú</th>
          </tr>
          <tr>
            <td>Nội thành HN/HCM</td>
            <td>2-4 giờ</td>
            <td>Giao hàng nhanh</td>
          </tr>
          <tr>
            <td>Ngoại thành & tỉnh lân cận</td>
            <td>24-48 giờ</td>
            <td>-</td>
          </tr>
          <tr>
            <td>Các tỉnh khác</td>
            <td>2-5 ngày làm việc</td>
            <td>Tùy khoảng cách</td>
          </tr>
        </table>
        
        <h4>Phí vận chuyển</h4>
        <ul>
          <li><strong>Miễn phí ship:</strong> Đơn hàng từ 400.000₫ (nội thành)</li>
          <li><strong>Nội thành:</strong> 25.000₫ (đơn dưới 400.000₫)</li>
          <li><strong>Ngoại thành:</strong> 35.000₫</li>
          <li><strong>Tỉnh xa:</strong> Tính theo cân nặng, từ 30.000₫/kg</li>
        </ul>
        
        <h4>Đóng gói & bảo quản</h4>
        <ul>
          <li>Với đặc thù của Việt Phục, mọi sản phẩm đều được SẮC đóng gói trong <strong>hộp cứng chuyên dụng, có lớp giấy bọc chống ẩm và thẻ hướng dẫn bảo quản</strong> để đảm bảo form dáng áo không bị ảnh hưởng trong quá trình vận chuyển.</li>
        </ul>
        
      
      `,
      isExpanded: false
    },
    
  ];

  // 3. Inject PLATFORM_ID vào constructor
  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Sửa lỗi: Chỉ chạy scrollTo nếu đang ở môi trường trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    this.route.queryParams.subscribe(params => {
      const openPolicy = params['open'];
      if (openPolicy) {
        this.openSpecificPolicy(openPolicy);
      } else {
        this.openPolicyByRoute(this.route.snapshot.routeConfig?.path);
      }
    });
  }

  private openPolicyByRoute(routePath: string | undefined): void {
    const routePolicyMap: { [key: string]: string } = {
      'ship': 'shipping',
      'ship-method': 'shipping'
    };

    const mappedPolicy = routePolicyMap[routePath ?? ''];
    if (mappedPolicy) {
      this.openSpecificPolicy(mappedPolicy);
    }
  }

  openSpecificPolicy(policyType: string): void {
    const policyMap: { [key: string]: number } = {
      'return': 1,
      'returns': 1,
      'security': 3,
      'privacy': 3,
      'payment': 2,
      'shipping': 4,
      'terms': 1,
      'term': 1
    };

    const policyId = policyMap[policyType];
    if (policyId) {
      this.policies.forEach(p => p.isExpanded = false);
      const policy = this.policies.find(p => p.id === policyId);
      if (policy) {
        policy.isExpanded = true;
      }
    }
  }

  toggleAccordion(policyId: number): void {
    const policy = this.policies.find(p => p.id === policyId);
    if (policy) {
      policy.isExpanded = !policy.isExpanded;
      
      setTimeout(() => {
        // Logic phụ của bạn giữ nguyên
      }, 100);
    }
  }
}