import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UserApiService } from '../user-api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user: any = null;
  cartCount: number = 0;
  showSearchModal: boolean = false;
  showCartModal: boolean = false;
  showUserDropdown: boolean = false;

  get hasCustomAvatar(): boolean {
    const avatar = String(this.user?.avatar ?? '').trim().toLowerCase();
    if (!avatar) {
      return false;
    }

    return !(
      avatar === '/assets/user.png' ||
      avatar.endsWith('/assets/user.png') ||
      avatar.endsWith('assets/user.png')
    );
  }
  
  productSuggestions: string[] = [
    'Áo dài truyền thống',
    'Áo dài cách tân',
    'Việt phục nam',
    'Việt phục nữ',
    'Áo bà ba',
    'Phụ kiện',
    'Lụa tơ tằm',
    'Voan',
    'Thêu tay',
    'Áo dài hoa',
    'Áo dài trơn',
    'Túi xách',
    'Khăn lụa',
    'Dây chuyền',
  ];
  
  popularCategories: string[] = [
    'Áo dài',
    'Việt phục',
    'Phụ kiện',
    'Áo bà ba',
  ];
  
  filteredSuggestions: string[] = [];

  constructor(private userApi: UserApiService, private router: Router) {}

  private scrollTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  openLoginPage(): void {
    if (this.router.url.startsWith('/login')) {
      this.scrollTop();
      return;
    }

    this.router.navigate(['/login']).then(() => {
      this.scrollTop();
    });
  }

  onSearch() {
    this.showSearchModal = true;
    this.filteredSuggestions = [];
    setTimeout(() => {
      const input = document.querySelector('.search-field') as HTMLInputElement;
      if (input) {
        input.focus();
        input.value = '';
      }
    }, 150);
  }

  closeSearchModal() {
    this.showSearchModal = false;
    this.filteredSuggestions = [];
  }

  filterSuggestions(value: string) {
    if (value.trim().length === 0) {
      this.filteredSuggestions = [];
      return;
    }
    const lowerValue = value.toLowerCase();
    this.filteredSuggestions = this.productSuggestions
      .filter(item => item.toLowerCase().includes(lowerValue))
      .slice(0, 8); // Limit to 8 suggestions
  }

  selectSuggestion(suggestion: string) {
    const input = document.querySelector('.search-field') as HTMLInputElement;
    if (input) {
      input.value = suggestion;
    }
    this.performSearchDirect(suggestion);
  }

  performSearch(event: any) {
    const keyword = event.target.value.trim();
    this.performSearchDirect(keyword);
  }

  performSearchDirect(keyword: string) {
    if (keyword) {
      this.closeSearchModal();
      this.router.navigate(['/products'], { queryParams: { q: keyword } });
    }
  }

  handleImageSearch(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Create FormData for image
      const formData = new FormData();
      formData.append('image', file);
      
      // For now, just show a message
      alert('Tính năng tìm kiếm bằng hình ảnh sẽ được cập nhật sớm!');
      console.log('Image search:', file.name);
      
      // In future, you can send to backend:
      // this.http.post('/api/search/image', formData).subscribe(...)
    }
  }

  onCart() {
    if (!this.user) {
      this.showCartModal = true;
      return;
    }

    this.router.navigate(['/cart']);
  }

  closeCartModal() {
    this.showCartModal = false;
  }

  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
  }

  viewAccountInfo(event: Event): void {
    event.stopPropagation();
    this.showUserDropdown = false;
    this.router.navigate(['/account/profile']);
  }

  logout(event: Event): void {
    event.stopPropagation();
    localStorage.removeItem('user');
    this.userApi.logout();
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }

  goToLogin() {
    this.closeCartModal();
    this.openLoginPage();
  }

  goToSignup() {
    this.closeCartModal();
    this.router.navigate(['/signup']);
  }

  onLogin() {
    console.log("Login clicked");
  }

  getCategoryClass(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Áo dài': 'chip-ao-dai',
      'Việt phục': 'chip-viet-phuc',
      'Phụ kiện': 'chip-phu-kien',
      'Áo bà ba': 'chip-ao-ba-ba',
    };
    return categoryMap[category] || 'chip-default';
  }

  ngOnInit(){
    this.userApi.currentUser$.subscribe(user=>{
      this.user = user;
      if (!user) {
        this.showUserDropdown = false;
      }
    });
  }
}
