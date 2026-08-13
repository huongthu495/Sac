
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductApiService } from '../product-api.service';
import { Product } from '../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CartApiService } from '../cart-api.service';
import { CartService } from '../services/cart.service';
import { WishlistApiService } from '../wishlist-api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})

export class ProductDetail implements OnInit {

  // ...existing code...

  buyNow() {
    // If product has sizes, ensure a size is selected
    if (this.product?.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
      alert('Vui lòng chọn size trước khi mua!');
      return;
    }

    if (!this.product) {
      alert('Không tìm thấy thông tin sản phẩm!');
      return;
    }

    // build cart item; include size when selected
    const name = this.selectedSize ? `${this.product.product_name} - Size ${this.selectedSize}` : this.product.product_name;
    const cartItem = {
      name,
      price: this.product.unit_price,
      image: this.product.images?.[0] || '',
      quantity: this.quantity
    };

    // Sử dụng CartService API để thêm vào giỏ hàng backend
    this.localCartService.addToCart(cartItem).subscribe({
      next: () => {
        console.log('Added to cart for buy now');
        // Chuyển hướng đến trang giỏ hàng
        this.router.navigate(['/cart'], { queryParams: { buyNow: 1 } });
      },
      error: (err) => {
        console.error('Error adding to cart for buy now:', err);
        alert('Có lỗi khi thêm sản phẩm vào giỏ hàng!');
      }
    });
  }

  product!: Product;
  selectedImage: string = '';
  quantity: number = 1;

  selectedSize: string | null = null;

  relatedProducts: Product[] = [];
  viewedProducts: Product[] = [];

  showSizeGuide = false;
  isWishlisted = false;
  // Chọn size
  selectSize(size: string) {
    this.selectedSize = size;
    // Reset lại số lượng khi chọn size mới
    this.quantity = 1;
  }

  // Lấy số lượng còn lại của size đã chọn
  getSelectedSizeQuantity(): number {
    if (!this.product?.sizes || !this.selectedSize) return 0;
    const found: any = this.product.sizes.find((s: any) => s.size === this.selectedSize);
    return found ? (Number(found.quantity || found.stock || 0)) : 0;
  }

  // total available stock (for accessories or summed sizes)
  getAvailableStock(): number {
    if (!this.product) return 0;
    if (this.product.sizes && this.product.sizes.length > 0) {
      return this.product.sizes.reduce((s: number, it: any) => s + (Number((it as any).quantity || (it as any).stock || 0) || 0), 0);
    }
    const p: any = this.product as any;
    return Number(p.stock || p.stocked_quantity || 0) || 0;
  }

  isSoldOut(): boolean {
    return this.getAvailableStock() === 0;
  }

  constructor(
    private route: ActivatedRoute,
    private productService: ProductApiService,
    private cdr: ChangeDetectorRef,
    private cartService: CartApiService,
    private localCartService: CartService,
    private router: Router,
    private wishlistService: WishlistApiService,
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (id) {
        this.loadProduct(id);
      }

    });

  }

  loadProduct(id: string) {

    this.productService.getProduct(id).subscribe(data => {

      this.product = data;

      this.selectedImage = data.images?.[0] || '';

      this.loadRelatedProducts(data.product_dept, data._id);
      this.syncWishlistState();

      this.saveViewedProduct(data);
      this.loadViewedProducts();

      this.cdr.detectChanges();

    });

  }

  loadRelatedProducts(dept: string, currentId: string) {

    this.productService.getProducts().subscribe((data: any) => {
      this.relatedProducts = data
        .filter((p: any) => p.product_dept === dept && p._id !== currentId)
        .slice(0, 4);
    });
  }

  // lưu sản phẩm đã xem
  saveViewedProduct(product: Product) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let viewed = JSON.parse(
      localStorage.getItem('viewedProducts') || '[]'
    );
    // xóa nếu đã tồn tại
    viewed = viewed.filter((p: any) => p._id !== product._id);
    // thêm vào đầu
    viewed.unshift(product);
    // chỉ giữ 4 sản phẩm
    viewed = viewed.slice(0, 4);
    localStorage.setItem(
      'viewedProducts',
      JSON.stringify(viewed)
    );
  }

  // load sản phẩm đã xem
  loadViewedProducts() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    this.viewedProducts = JSON.parse(
      localStorage.getItem('viewedProducts') || '[]'
    );
  }
  addToCart() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      alert('Tính năng này chỉ hoạt động trên trình duyệt.');
      return;
    }

    if (!this.product) {
      alert('Không tìm thấy thông tin sản phẩm!');
      return;
    }

    // If product has sizes, require a size selection
    if (this.product.sizes && this.product.sizes.length > 0 && !this.selectedSize) {
      alert('Vui lòng chọn size trước khi thêm vào giỏ hàng!');
      return;
    }

    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng và nhận voucher ưu đãi.');
      this.router.navigate(['/login']);
      return;
    }

    const name = this.selectedSize ? `${this.product.product_name} - Size ${this.selectedSize}` : this.product.product_name;
    const cartItem: any = {
      name,
      price: this.product.unit_price,
      image: this.getImageSrc(this.product.images?.[0]),
      quantity: this.quantity,
      productId: this.product._id,
    };

    // Sử dụng CartService API để thêm vào backend
    this.localCartService.addToCart(cartItem).subscribe({
      next: () => {
        alert('Đã thêm vào giỏ hàng');
      },
      error: (err) => {
        console.error('Lỗi thêm vào giỏ hàng:', err);
        alert('Có lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!');
      }
    });
  }

  toggleWishlist() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const userRaw = window.localStorage.getItem('user');
    if (!userRaw) {
      alert('Vui lòng đăng nhập để thêm sản phẩm yêu thích.');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userRaw);
    const userId = user?._id;
    if (!userId || !this.product?._id) return;

    const currentWishlist = this.wishlistService.getWishlistByUser(userId);
    const existing = currentWishlist.find((item: any) => item.productId === this.product._id);

    if (existing) {
      this.wishlistService.removeFromWishlist(existing._id);
      this.isWishlisted = false;
      return;
    }

    this.wishlistService.addToWishlist({
      userId,
      productId: this.product._id,
      productName: this.product.product_name,
      productPrice: this.product.unit_price,
      productSku: this.product._id,
      productImage: this.getImageSrc(this.product.images?.[0]),
    });

    this.isWishlisted = true;
  }

  private syncWishlistState() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.isWishlisted = false;
      return;
    }
    const userRaw = window.localStorage.getItem('user');
    if (!userRaw || !this.product?._id) {
      this.isWishlisted = false;
      return;
    }

    const user = JSON.parse(userRaw);
    const userId = user?._id;
    if (!userId) {
      this.isWishlisted = false;
      return;
    }

    const wishlist = this.wishlistService.getWishlistByUser(userId);
    this.isWishlisted = wishlist.some((item: any) => item.productId === this.product._id);
  }

  changeImage(img: string) {
    this.selectedImage = img;
  }

  increase() {
    this.quantity++;
  }

  decrease() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  openSizeGuide() {
    this.showSizeGuide = true;
  }

  closeSizeGuide() {
    this.showSizeGuide = false;
  }

  // trả đúng đường dẫn ảnh: base64 / http dùng trực tiếp, còn lại thêm /assets/
  getImageSrc(img: string | undefined): string {
    if (!img) return '/assets/placeholder.jpg';
    if (img.startsWith('data:') || img.startsWith('http')) return img;
    if (img.startsWith('/')) return img;
    return '/assets/' + img;
  }

}