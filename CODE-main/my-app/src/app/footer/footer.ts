import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  openPage(path: string): void {
    const scrollTop = () => {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    const isSameRoute = path === '/'
      ? this.router.url === '/'
      : this.router.url.startsWith(path);

    if (isSameRoute) {
      scrollTop();
      return;
    }

    this.router.navigateByUrl(path).then(() => {
      scrollTop();
    });
  }

  openSupportTab(tab: 'faq' | 'order' | 'return'): void {
    const targetUrl = `/how-to-buy?open=${tab}`;
    const currentUrl = this.router.url;

    // If already on the same tab, force scroll again so repeated clicks still work.
    if (currentUrl.startsWith('/how-to-buy')) {
      const query = this.router.parseUrl(currentUrl).queryParams;
      if (query['open'] === tab) {
        this.scrollToSupportSection(tab, 'smooth');
        return;
      }
    }

    this.router.navigateByUrl(targetUrl).then(() => {
      this.scrollToSupportSection(tab, 'smooth');
    });
  }

  openPolicyPage(): void {
    this.openPage('/policy');
  }

  private getHeaderOffset(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 140;
    }

    const header = document.querySelector('app-header .header') as HTMLElement | null;
    const measured = header?.offsetHeight ?? 0;
    return measured > 0 ? measured + 18 : 140;
  }

  private scrollToSupportSection(tab: 'faq' | 'order' | 'return', behavior: ScrollBehavior): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const sectionMap: Record<'faq' | 'order' | 'return', number> = {
      faq: 1,
      order: 2,
      return: 3,
    };

    const sectionId = sectionMap[tab];
    const sectionEl = document.getElementById(`support-tab-${sectionId}`);
    if (!sectionEl) {
      return;
    }

    const top = sectionEl.getBoundingClientRect().top + window.scrollY - this.getHeaderOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
  }
}
