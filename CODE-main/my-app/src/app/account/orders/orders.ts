import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderApiService } from '../../order-api.service';
import { AddressService } from '../../address.service';


interface OrderItem {
  name?: string;
  qty?: number;
  price?: number;
  image?: string;
  sku?: string;
}

interface Order {
  _id?: string;
  createdAt?: string | Date;
  orderItems?: OrderItem[];
  totalPrice?: number;
  subTotal?: number;
  shippingFee?: number;
  status?: string;
  paymentMethod?: string;
  isPaid?: boolean;
  shippingAddress?: string;
  customerInfo?: { name?: string; phone?: string; address?: string };
  customerName?: string;
  phone?: string;
  orderID?: string;
  user?: string;
  userId?: string;
  shippingAddressObj?: any;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  loading = false;
  statusFilter = 'all';
  expandedOrderId: string | null = null;
  userId: string = '';
  // modal state for viewing order details
  selectedOrder: Order | null = null;
  showOrderModal = false;

  constructor(private orderApiService: OrderApiService, private addressService: AddressService) {
    // Kiểm tra localStorage có tồn tại (tránh lỗi SSR)
    if (typeof localStorage !== 'undefined') {
      this.userId = JSON.parse(localStorage.getItem('user') || '{}')._id || '';
    }
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderApiService.getOrders().subscribe({
      next: (data) => {
        // Filter orders for current user
        this.orders = data.filter((order: any) => order.user === this.userId || order.userId === this.userId);

        // For each order, try to fetch saved address (attach shippingAddress)
        this.orders.forEach((order) => {
          // Ensure subtotal and shipping fee are populated for display
          try {
            const items = order.orderItems || (order as any).items || [];
            const computedSub = items.reduce((acc: number, it: any) => {
              const p = Number(it.price || it.unit_price || 0) || 0;
              const q = Number(it.qty || it.quantity || it.qtyOrdered || 0) || 0;
              return acc + p * q;
            }, 0);
            if (order.subTotal == null) order.subTotal = computedSub;
            if (order.shippingFee == null) {
              if ((order as any).shipping_fee != null) order.shippingFee = (order as any).shipping_fee;
              // if no explicit shipping fee, we'll compute it after retrieving address
            }
            // ensure totalPrice reflects subTotal + shippingFee when backend didn't provide it
            if (order.totalPrice == null) {
              const st = Number(order.subTotal || 0) || 0;
              const sf = Number(order.shippingFee || 0) || 0;
              order.totalPrice = st + sf;
            }
          } catch (e) {
            // ignore
          }
          const uid = order?.user || order?.userId || this.userId;
          if (uid) {
            this.addressService.getAddressByUser(uid).subscribe({
              next: (addr: any) => {
                console.log('loadOrders addressService.getAddressByUser response for', uid, addr);
                if (!addr) return;
                // normalize to string
                let addrString = '';
                if (typeof addr === 'string') addrString = addr;
                else if (addr.address) addrString = addr.address;
                else if (addr.fullAddress) addrString = addr.fullAddress;
                else {
                  const parts = [];
                  if (addr.houseNumber) parts.push(addr.houseNumber);
                  if (addr.street) parts.push(addr.street);
                  if (addr.address) parts.push(addr.address);
                  if (addr.ward) parts.push(addr.ward);
                  if (addr.district) parts.push(addr.district);
                  if (addr.city) parts.push(addr.city);
                  if (addr.province) parts.push(addr.province);
                  addrString = parts.filter(Boolean).join(', ');
                }
                order.shippingAddress = order.shippingAddress || addrString;
                // keep original address object for template to access `address`, `ward`, `city`
                if (addr && typeof addr === 'object') order.shippingAddressObj = addr;
                if (!order.customerInfo) order.customerInfo = {};
                order.customerInfo.address = order.customerInfo.address || addrString;
                // compute shipping fee if not already set
                if (order.shippingFee == null) {
                  const cityCandidate = (addr && typeof addr === 'object' ? addr.city : '') || addrString || (order.customerInfo && (order.customerInfo as any).city) || order.customerInfo.address;
                      const fee = this.computeShippingFeeFromLocation(cityCandidate);
                      order.shippingFee = fee;
                      console.log('computed shipping fee for order', order._id, 'cityCandidate=', cityCandidate, 'fee=', fee);
                }
              },
              error: () => {}
            });
          }
        });

        this.filterOrders();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    if (this.statusFilter === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.statusFilter);
    }
  }

  toggleOrderExpand(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  viewOrder(order: any): void {
    this.selectedOrder = order;
    // Try to load saved address for the order's user and attach to selectedOrder
    const uid = order?.user || order?.userId || this.userId;
    console.log('viewOrder uid:', uid, 'order:', order);
    if (uid) {
      this.addressService.getAddressByUser(uid).subscribe({
        next: (addr: any) => {
          console.log('addressService.getAddressByUser response for', uid, addr);
          // Normalize various address shapes from API
          let addrString = '';
          if (!addr) addrString = '';
          else if (typeof addr === 'string') addrString = addr;
          else if (addr.address) addrString = addr.address;
          else if (addr.fullAddress) addrString = addr.fullAddress;
          else {
            const parts = [];
            if (addr.houseNumber) parts.push(addr.houseNumber);
            if (addr.street) parts.push(addr.street);
            if (addr.address) parts.push(addr.address);
            if (addr.ward) parts.push(addr.ward);
            if (addr.district) parts.push(addr.district);
            if (addr.city) parts.push(addr.city);
            if (addr.province) parts.push(addr.province);
            addrString = parts.filter(Boolean).join(', ');
          }
          if (this.selectedOrder) {
            // prefer an explicit shippingAddress; otherwise set customerInfo.address
            this.selectedOrder.shippingAddress = this.selectedOrder.shippingAddress || addrString;
            if (addr && typeof addr === 'object') this.selectedOrder.shippingAddressObj = addr;
            if (!this.selectedOrder.customerInfo) this.selectedOrder.customerInfo = {};
            this.selectedOrder.customerInfo.address = this.selectedOrder.customerInfo.address || addrString;
            // compute subtotal and ensure shipping fee present for modal summary
            try {
              const items = this.selectedOrder.orderItems || (this.selectedOrder as any).items || [];
              const computedSub = items.reduce((acc: number, it: any) => {
                const p = Number(it.price || it.unit_price || 0) || 0;
                const q = Number(it.qty || it.quantity || it.qtyOrdered || 0) || 0;
                return acc + p * q;
              }, 0);
                if (this.selectedOrder.subTotal == null) this.selectedOrder.subTotal = computedSub;
                if (this.selectedOrder.shippingFee == null) {
                  if ((this.selectedOrder as any).shipping_fee != null) this.selectedOrder.shippingFee = (this.selectedOrder as any).shipping_fee;
                  // otherwise compute below after we have addrString
                }
            } catch (e) {}
              // compute shipping fee now using addr / addrString if still not set
              if (this.selectedOrder && this.selectedOrder.shippingFee == null) {
                const cityCandidate = (addr && typeof addr === 'object' ? addr.city : '') || addrString || (this.selectedOrder.customerInfo && (this.selectedOrder.customerInfo as any).city) || this.selectedOrder.customerInfo?.address;
                const fee = this.computeShippingFeeFromLocation(cityCandidate);
                this.selectedOrder.shippingFee = fee;
                console.log('computed shipping fee for selectedOrder', this.selectedOrder._id, 'cityCandidate=', cityCandidate, 'fee=', fee);
              }
              // compute totalPrice for modal and log values
              if (this.selectedOrder) {
                const st = Number(this.selectedOrder.subTotal || 0) || 0;
                const sf = Number(this.selectedOrder.shippingFee || 0) || 0;
                this.selectedOrder.totalPrice = st + sf;
                console.log('selectedOrder totals:', { orderId: this.selectedOrder._id, subTotal: st, shippingFee: sf, totalPrice: this.selectedOrder.totalPrice });
              }
          }
        },
        error: () => {
          // no-op: address may not exist for user
        }
      });
    }
    this.showOrderModal = true;
  }

  closeOrderModal(): void {
    this.selectedOrder = null;
    this.showOrderModal = false;
  }

  cancelOrder(orderId: string): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      this.orderApiService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => console.error('Error cancelling order:', err)
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-pending',
      'processing': 'badge-processing',
      'shipped': 'badge-shipped',
      'delivered': 'badge-delivered',
      'cancelled': 'badge-cancelled'
    };
    return statusClasses[status] || 'badge-pending';
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusLabels[status] || status;
  }

  /**
   * Return a display code for an order. Prefer `orderID` (backend generated),
   * otherwise fall back to the last 8 chars of `_id` uppercased.
   */
  formatOrderCode(order?: Order | null): string {
    if (!order) return '';
    if (order.orderID) return order.orderID;
    // Show the full Mongo ObjectId by default so order codes match backend
    // (e.g. "69c07f1f2c2c0ac6eece4520"). If you prefer a shorter label,
    // update this function to slice or format as needed.
    return order._id || '';
  }

  // Determine whether an order should be considered paid on the client
  orderIsPaid(order: any): boolean {
    if (!order) return false;
    // Backend may provide explicit flag
    if (order.isPaid) return true;
    // Treat non-COD payment methods as paid (e.g., 'online', 'vnpay', 'momo')
    const pm = (order.paymentMethod || order.payment || '').toString().toLowerCase();
    if (pm && pm !== 'cod' && pm !== 'cash') return true;
    return false;
  }

  // Return true when order payment method indicates COD/cash
  isCod(order: any): boolean {
    if (!order) return false;
    const pm = (order.paymentMethod || order.payment || '').toString().toLowerCase();
    return pm.includes('cod') || pm.includes('cash') || pm === 'cod' || pm === 'cash';
  }

  // Helper to show payment label: 'COD' for cash-on-delivery, otherwise 'Đã thanh toán'
  getPaymentLabel(order: any): string {
    if (!order) return '';
    return this.isCod(order) ? 'COD' : 'Đã thanh toán';
  }

  // Compute shipping fee based on city/location: HCM city => 25000, others => 35000
  private computeShippingFeeFromLocation(loc?: string | null): number {
    const raw = (loc || '').toString().toLowerCase().trim();
    if (!raw) return 35000;
      // remove combining diacritic marks using Unicode range and fallback
      let normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      // remove spaces, dots, hyphens
      normalized = normalized.replace(/\s|\.|\-/g, '');
    if (normalized.includes('hochiminh') || normalized.includes('tphcm') || normalized.includes('hcm')) return 25000;
    return 35000;
  }
}