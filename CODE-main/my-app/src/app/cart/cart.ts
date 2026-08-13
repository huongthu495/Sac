import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationApiService } from '../location-api.service';
import { OrderApiService } from '../order-api.service';
import { CartService } from '../services/cart.service';
import { AddressService } from '../address.service';
import { Subscription } from 'rxjs';
import { Qr } from '../qr/qr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, Qr],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit, OnDestroy {

  provinces: any[] = [];
  wards: any[] = [];

  selectedProvince: any;
  selectedWard: any;
  @ViewChild('qr') qrComponent?: Qr;

  form = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };

  paymentMethod = 'online';

  cart: any[] = [];
  total = 0;
  shippingFee = 35000; // default
  loading = false;
  
  private cartSubscription?: Subscription;
  // Toast / notification state
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' | null = null;
  private toastTimer: any = null;

  constructor(
    private locationService: LocationApiService,
    private orderService: OrderApiService,
    private cartService: CartService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.locationService.getProvinces().subscribe(res => {
      this.provinces = res;
      // Try to autofill form when provinces are available
      this.tryAutoFillFromUser();
    });

    // Lắng nghe thay đổi giỏ hàng real-time
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.calculateTotal();
      console.log('Cart updated from API:', cart.length, 'items');
    });

    // Load giỏ hàng từ API khi khởi tạo
    this.cartService.loadCartFromAPI();
  }

  private tryAutoFillFromUser() {
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;
      const user = JSON.parse(userRaw);
      // fill name/email if available (check multiple possible keys)
      // Support multiple possible name keys used across app/backends
      const detectedName = (
        user.name || user.profileName || user.fullName || user.fullname || user.displayName || user.username ||
        (user.firstName && user.lastName ? (user.firstName + ' ' + user.lastName) : '') ||
        ''
      ).toString().trim();
      if (detectedName) this.form.name = detectedName;
      this.form.email = user.email || this.form.email;

      const userId = user._id || user.id;
      if (!userId) return;

      this.addressService.getAddressByUser(userId).subscribe({
        next: (res: any) => {
          const value = Array.isArray(res) ? res[0] : res;
          if (!value) return;
          // fill phone / address
          this.form.phone = value.phone || this.form.phone;
          this.form.address = value.address || this.form.address;

          // set selected province (prefer code) and update shipping fee
          if (value.city) {
            const provinceObj = this.provinces.find(p => p.name === value.city || p.name?.includes(value.city));
            if (provinceObj && provinceObj.code) {
              this.selectedProvince = provinceObj.code;
            } else {
              this.selectedProvince = value.city;
            }
            this.updateShippingFee();
            // load wards (merge from districts) so phường/xã options appear
            if (provinceObj && provinceObj.code) {
              this.locationService.getDistricts(provinceObj.code).subscribe(districts => {
                this.wards = [];
                districts.forEach((d: any) => {
                  if (d.wards) this.wards = this.wards.concat(d.wards);
                });
                this.wards.sort((a:any,b:any)=>a.name.localeCompare(b.name));
                  // try set selected ward by name -> set to ward code so select shows value
                  if (value.ward) {
                    const wardObj = this.wards.find((w:any)=>w.name === value.ward);
                    if (wardObj) {
                      this.selectedWard = wardObj.code;
                    }
                  }
              });
              }
            // ensure UI updates after async autofill
            this.defChangeRec();
          }
        },
        error: (err:any) => {
          // ignore autofill errors
          console.warn('Autofill address failed', err);
        }
      });
    } catch (e) {
      // ignore
    }
    // ensure change detection runs after sync autofill
    this.defChangeRec();
  }

  // Force change detection so autofilled values appear immediately
  defChangeRec() {
    try {
      this.cdr.detectChanges();
    } catch (e) {
      // ignore
    }
  }
  
  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  calculateTotal() {
    this.total = this.cart.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  // Recalculate shipping fee based on selected province
  updateShippingFee() {
    let provinceName: any = this.selectedProvince;
    if (typeof this.selectedProvince === 'number') {
      const p = this.provinces.find(pr => pr.code === this.selectedProvince);
      provinceName = p ? p.name : this.selectedProvince;
    }

    if (provinceName === 'Thành phố Hồ Chí Minh') {
      this.shippingFee = 25000;
    } else {
      this.shippingFee = 35000;
    }
  }

  // Sử dụng CartService API thay vì thao tác localStorage
  increase(item: any) {
    this.loading = true;
    this.cartService.updateQuantity(item._id, item.quantity + 1).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Error increasing quantity:', err);
        this.loading = false;
            this.showToast('Có lỗi khi cập nhật số lượng', 'error');
      }
    });
  }

  decrease(item: any) {
    if (item.quantity > 1) {
      this.loading = true;
      this.cartService.updateQuantity(item._id, item.quantity - 1).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error decreasing quantity:', err);
          this.loading = false;
              this.showToast('Có lỗi khi cập nhật số lượng', 'error');
        }
      });
    }
  }
  
  removeItem(item: any) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      this.loading = true;
      this.cartService.removeFromCart(item._id).subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.loading = false;
              this.showToast('Có lỗi khi xóa sản phẩm', 'error');
        }
      });
    }
  }

  // ✅ FIX IMAGE
  resolveAssetImage(image?: string | null) {
    if (!image) return 'assets/default.png';

    if (image.startsWith('http') || image.startsWith('/assets')) {
      return image;
    }

    return 'assets/' + image;
  }

  onProvinceChange(event: any) {
    const provinceCode = Number(event.target.value);
    const provinceObj = this.provinces.find(p => p.code === provinceCode);
    // store province as code so select [(ngModel)] displays correctly
    this.selectedProvince = provinceObj ? provinceObj.code : null;

    this.selectedWard = null; // Reset ward selection
    this.wards = []; // Clear wards

    // Update fee immediately based on selected province (no need to wait for wards)
    this.updateShippingFee();

    if (provinceCode) {
      // Load tất cả phường/xã từ tất cả huyện của tỉnh đã chọn
      this.locationService.getDistricts(provinceCode).subscribe(districts => {
        this.wards = [];
        districts.forEach((district: any) => {
          if (district.wards) {
            this.wards = this.wards.concat(district.wards);
          }
        });
        // Sắp xếp theo tên
        this.wards.sort((a, b) => a.name.localeCompare(b.name));
        // After loading wards, update shipping fee in case province changed
        this.updateShippingFee();
      });
    }
  }

  onWardChange(event: any) {
    const wardCode = Number(event.target.value);
    const wardObj = this.wards.find(w => w.code === wardCode);
    // store ward as code so select displays correctly
    this.selectedWard = wardObj ? wardObj.code : null;
  }

  submitOrder() {
    if (!this.form.name || !this.form.phone || !this.selectedWard) {
            this.showToast('Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    if (this.cart.length === 0) {
            this.showToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.', 'error');
      return;
    }
    // Prepare customer info payload
    const provinceName = typeof this.selectedProvince === 'number'
      ? (this.provinces.find(p => p.code === this.selectedProvince)?.name || '')
      : (this.selectedProvince || '');
    const wardName = typeof this.selectedWard === 'number'
      ? (this.wards.find(w => w.code === this.selectedWard)?.name || '')
      : (this.selectedWard || '');

    const customerInfo = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      address: `${this.form.address}${wardName ? ', ' + wardName : ''}${provinceName ? ', ' + provinceName : ''}`,
      paymentMethod: this.paymentMethod
    };

    // If online payment, open QR modal and wait for confirmation
    if (this.paymentMethod === 'online') {
      if (this.qrComponent) {
        this.qrComponent.open('momo');
      }
      return;
    }

    // Otherwise (COD) create order immediately
    this.loading = true;
    this.cartService.createOrderFromCart(customerInfo, this.paymentMethod).subscribe({
      next: (response) => {
        this.loading = false;
          this.showToast('Đơn hàng đã cập nhật thành công', 'success');

        // Reset form
        this.form = { name: '', phone: '', email: '', address: '' };
        this.selectedProvince = null;
        this.selectedWard = null;
        this.wards = [];

        // Giỏ hàng đã tự động clear trong CartService
        console.log('Order created successfully:', response);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating order:', err);
            this.showToast('Đơn hàng đã cập nhật thành công', 'success');
      }
    });
  }

  // Simple toast helper
  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.toastTimer = null;
    }, 3500);
  }

  onQrConfirmed() {
    // Build same customerInfo and create order
    const provinceName = typeof this.selectedProvince === 'number'
      ? (this.provinces.find(p => p.code === this.selectedProvince)?.name || '')
      : (this.selectedProvince || '');
    const wardName = typeof this.selectedWard === 'number'
      ? (this.wards.find(w => w.code === this.selectedWard)?.name || '')
      : (this.selectedWard || '');

    const customerInfo = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      address: `${this.form.address}${wardName ? ', ' + wardName : ''}${provinceName ? ', ' + provinceName : ''}`,
      paymentMethod: this.paymentMethod
    };

    this.loading = true;
    this.cartService.createOrderFromCart(customerInfo, this.paymentMethod).subscribe({
      next: (response) => {
        this.loading = false;
        this.showToast('Đơn hàng đã cập nhật thành công', 'success');

        // Reset form
        this.form = { name: '', phone: '', email: '', address: '' };
        this.selectedProvince = null;
        this.selectedWard = null;
        this.wards = [];
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating order:', err);
        this.showToast('Đơn hàng đã cập nhật thành công', 'success');
      }
    });
  }
}