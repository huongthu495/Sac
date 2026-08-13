import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type BlogStatus = 'draft' | 'published';

interface BlogItem {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  authorId?: string;
  authorName?: string;
  status: BlogStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogForm {
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  authorId: string;
  authorName: string;
  status: BlogStatus;
  publishedAt: string;
}

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-management.html',
  styleUrl: './blog-management.css',
})
export class BlogManagement implements OnInit {

  @ViewChild('contentEditor') contentEditor?: ElementRef<HTMLDivElement>;
  @ViewChild('blogFormPanel') blogFormPanel?: ElementRef;

  private apiUrl = 'http://localhost:3000/blogs';
  private uploadUrl = 'http://localhost:3000/upload-image';

  blogs: BlogItem[] = [];
  filteredBlogs: BlogItem[] = [];
  paginatedBlogs: BlogItem[] = [];

  searchText = '';
  statusFilter = '';

  currentPage = 1;
  pageSize = 8;
  totalPages = 1;

  showForm = false;
  isEditing = false;
  editingId: string | null = null;

  editorFontSize = '3';

  loading = false;
  saving = false;
  errorMsg = '';
  successMsg = '';

  formErrors = {
    title: false,
    content: false,
  };

  blogForm: BlogForm = this.createEmptyForm();

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBlogs();
    this.setDefaultAuthor();
    this.checkServerConnection();
  }

  checkServerConnection(): void {
    console.log('=== CHECKING SERVER CONNECTION ===');
    console.log('Testing API URL:', this.apiUrl);
    
    // Try to ping the blogs endpoint
    this.http.get(this.apiUrl).subscribe({
      next: (response) => {
        console.log('✓ Server connection OK');
        console.log('Server response:', response);
      },
      error: (err) => {
        console.error('✗ Server connection failed');
        console.error('Error details:', err);
        if (err.status === 0) {
          this.errorMsg = 'Không thể kết nối đến server tại http://localhost:3000. Vui lòng khởi động server backend.';
        } else {
          this.errorMsg = `Server có vấn đề (${err.status}). Kiểm tra logs server.`;
        }
      }
    });
  }

  loadBlogs(): void {
    this.loading = true;
    this.errorMsg = ''; // Reset error message
    
    this.http.get<BlogItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.blogs = data || [];
        this.applyFilters();
        this.loading = false;
        console.log(`Loaded ${this.blogs.length} blogs successfully`);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading blogs:', err);
        if (err.status === 0) {
          this.errorMsg = 'Không thể kết nối server. Kiểm tra server có đang chạy tại http://localhost:3000';
        } else {
          this.errorMsg = `Không tải được danh sách blog (${err.status})`;
        }
      }
    });
  }

  applyFilters(): void {
    const keyword = this.searchText.trim().toLowerCase();

    this.filteredBlogs = this.blogs.filter((blog) => {
      const matchKeyword = !keyword ||
        blog.title?.toLowerCase().includes(keyword) ||
        blog.excerpt?.toLowerCase().includes(keyword);

      const matchStatus = !this.statusFilter || blog.status === this.statusFilter;

      return matchKeyword && matchStatus;
    });

    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.filteredBlogs.length / this.pageSize));
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedBlogs = this.filteredBlogs.slice(start, end);
  }

  previousPage(): void {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.updatePagination();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) return;
    this.currentPage++;
    this.updatePagination();
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.blogForm = this.createEmptyForm();
    this.setDefaultAuthor();
    this.formErrors = { title: false, content: false };
    this.showForm = true;
    setTimeout(() => {
      if (this.contentEditor?.nativeElement) {
        this.contentEditor.nativeElement.innerHTML = '';
      }
      this.blogFormPanel?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  openEditForm(blog: BlogItem): void {
    this.isEditing = true;
    this.editingId = blog._id;

    this.blogForm = {
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      thumbnail: blog.thumbnail || '',
      authorId: String(blog.authorId || ''),
      authorName: blog.authorName || 'Admin',
      status: blog.status || 'draft',
      publishedAt: this.toDateTimeLocal(blog.publishedAt),
    };

    this.formErrors = { title: false, content: false };
    this.showForm = true;
    setTimeout(() => {
      if (this.contentEditor?.nativeElement) {
        this.contentEditor.nativeElement.innerHTML = this.blogForm.content || '';
      }
      this.blogFormPanel?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  closeForm(): void {
    this.showForm = false;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onTitleChange(): void {
    // keep for title reactive binding
  }

  onThumbnailFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ imageUrl: string }>(this.uploadUrl, formData).subscribe({
      next: (res) => {
        this.blogForm.thumbnail = res?.imageUrl || '';
      },
      error: () => {
        this.errorMsg = 'Upload ảnh thất bại';
      }
    });
  }

  onEditorInput(): void {
    this.blogForm.content = this.contentEditor?.nativeElement.innerHTML || '';
  }

  formatText(command: string, value?: string): void {
    this.focusEditor();
    document.execCommand(command, false, value);
    this.onEditorInput();
  }

  setFontSize(size: string): void {
    this.editorFontSize = size;
    this.formatText('fontSize', size);
  }

  onContentImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ imageUrl: string }>(this.uploadUrl, formData).subscribe({
      next: (res) => {
        const imageUrl = res?.imageUrl || '';
        if (!imageUrl) return;
        this.focusEditor();
        document.execCommand('insertImage', false, imageUrl);
        this.onEditorInput();
      },
      error: () => {
        this.errorMsg = 'Upload ảnh trong nội dung thất bại';
      }
    });

    input.value = '';
  }

  saveDraft(): void {
    this.submit('draft');
  }

  publishBlog(): void {
    this.submit('published');
  }

  submit(status: BlogStatus): void {
    console.log('=== STARTING BLOG SUBMIT ===');
    console.log('Status:', status);
    console.log('Is editing:', this.isEditing);
    console.log('API URL:', this.apiUrl);
    
    // Reset thông báo lỗi trước khi submit
    this.errorMsg = '';
    this.successMsg = '';

    // Đảm bảo luôn lấy nội dung mới nhất từ editor
    if (this.contentEditor?.nativeElement) {
      this.blogForm.content = this.contentEditor.nativeElement.innerHTML || '';
      console.log('Editor content length:', this.blogForm.content.length);
    }
    
    // Validation
    this.formErrors.title = !this.blogForm.title.trim();
    this.formErrors.content = !this.blogForm.content.trim() || this.blogForm.content === '<br>' || this.blogForm.content === '<div><br></div>';
    
    console.log('Form validation - Title:', !this.formErrors.title, 'Content:', !this.formErrors.content);
    
    if (this.formErrors.title) {
      this.errorMsg = 'Vui lòng nhập tiêu đề bài viết';
      console.log('Validation failed: Missing title');
      return;
    }
    
    if (this.formErrors.content) {
      this.errorMsg = 'Vui lòng nhập nội dung bài viết';
      console.log('Validation failed: Missing content');
      return;
    }

    this.saving = true;
    const payload = {
      title: this.blogForm.title.trim(),
      excerpt: this.blogForm.excerpt.trim(),
      content: this.blogForm.content,
      thumbnail: this.blogForm.thumbnail,
      authorId: this.blogForm.authorId || undefined,
      authorName: this.blogForm.authorName || 'Admin',
      status,
      publishedAt: status === 'published'
        ? (this.blogForm.publishedAt ? new Date(this.blogForm.publishedAt) : new Date())
        : null,
    };

    console.log('=== PAYLOAD DETAILS ===');
    console.log('Title:', payload.title);
    console.log('Content length:', payload.content?.length);
    console.log('Status:', payload.status);
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    if (this.isEditing && this.editingId) {
      console.log('=== UPDATING EXISTING BLOG ===');
      console.log('Edit ID:', this.editingId);
      
      this.http.put<BlogItem>(`${this.apiUrl}/${this.editingId}`, payload).subscribe({
        next: (response) => {
          console.log('=== UPDATE SUCCESS ===');
          console.log('Response:', response);
          this.saving = false;
          this.successMsg = status === 'published' ? 'Xuất bản bài viết thành công' : 'Cập nhật bài viết thành công';
          setTimeout(() => {
            this.showForm = false;
            this.loadBlogs();
          }, 1500);
        },
        error: (err) => {
          console.error('=== UPDATE ERROR ===');
          console.error('Full error object:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          console.error('Error body:', err.error);
          
          this.saving = false;
          if (err.status === 0) {
            this.errorMsg = 'Không thể kết nối đến server. Kiểm tra server có đang chạy không?';
          } else if (err.status === 404) {
            this.errorMsg = 'Không tìm thấy bài viết cần cập nhật';
          } else if (err.status >= 500) {
            this.errorMsg = 'Lỗi server. Vui lòng thử lại sau.';
          } else {
            this.errorMsg = err?.error?.message || `Cập nhật thất bại (Mã lỗi: ${err.status})`;
          }
        }
      });
      return;
    }

    console.log('=== CREATING NEW BLOG ===');
    this.http.post<BlogItem>(this.apiUrl, payload).subscribe({
      next: (response) => {
        console.log('=== CREATE SUCCESS ===');
        console.log('Response:', response);
        this.saving = false;
        this.successMsg = status === 'published' ? 'Xuất bản bài viết thành công' : 'Tạo bài viết thành công';
        setTimeout(() => {
          this.showForm = false;
          this.loadBlogs();
        }, 1500);
      },
      error: (err) => {
        console.error('=== CREATE ERROR ===');
        console.error('Full error object:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        
        this.saving = false;
        if (err.status === 0) {
          this.errorMsg = 'Không thể kết nối đến server. Kiểm tra server có đang chạy tại http://localhost:3000 không?';
        } else if (err.status === 400) {
          this.errorMsg = 'Dữ liệu không hợp lệ: ' + (err.error?.message || 'Kiểm tra lại thông tin');
        } else if (err.status === 500) {
          this.errorMsg = 'Lỗi server: ' + (err.error?.message || 'Vui lòng thử lại sau');
        } else {
          this.errorMsg = err?.error?.message || `Tạo bài viết thất bại (Mã lỗi: ${err.status}). Kiểm tra console để xem chi tiết.`;
        }
      }
    });
  }

  deleteBlog(id: string): void {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.successMsg = 'Đã xóa bài viết';
        this.loadBlogs();
      },
      error: () => {
        this.errorMsg = 'Xóa bài viết thất bại';
      }
    });
  }

  toggleStatus(blog: BlogItem): void {
    const nextStatus: BlogStatus = blog.status === 'published' ? 'draft' : 'published';
    const payload = {
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? (blog.publishedAt || new Date()) : null
    };

    this.http.put(`${this.apiUrl}/${blog._id}`, payload).subscribe({
      next: () => {
        this.loadBlogs();
      },
      error: () => {
        this.errorMsg = 'Đổi trạng thái thất bại';
      }
    });
  }

  visibleTags(tags: string[] = []): string[] {
    return tags.slice(0, 2);
  }

  remainingTagCount(tags: string[] = []): number {
    return Math.max(0, tags.length - 2);
  }

  statusLabel(status: BlogStatus): string {
    return status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
  }

  resolveThumbnail(src?: string): string {
    if (!src) return 'https://via.placeholder.com/56';
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')) return src;
    return `/assets/${src}`;
  }

  trackByBlogId(_index: number, item: BlogItem): string {
    return item._id;
  }

  private setDefaultAuthor(): void {
    let user = null;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const userRaw = localStorage.getItem('user');
      user = userRaw ? JSON.parse(userRaw) : null;
    }
    this.blogForm.authorId = user?._id || '';
    this.blogForm.authorName = user?.profileName || 'Admin';
  }

  private createEmptyForm(): BlogForm {
    return {
      title: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      authorId: '',
      authorName: 'Admin',
      status: 'draft',
      publishedAt: '',
    };
  }

  private focusEditor(): void {
    this.contentEditor?.nativeElement?.focus();
  }

  toDateTimeLocal(dateValue?: string | null): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

}
