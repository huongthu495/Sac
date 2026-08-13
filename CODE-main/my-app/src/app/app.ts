import { Component, HostListener, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { SacBee } from './sac-bee/sac-bee';
import { UserApiService } from './user-api.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer, SacBee],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('my-app');
  showHeaderFooter = true;
  showBackToTop = false;
  private lastScrollY = 0;

  constructor(private router: Router, private userApi: UserApiService) {}

  ngOnInit() {
    this.userApi.loadUserFromLocal();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeaderFooter = !event.url.startsWith('/admin');
      });
    this.showHeaderFooter = !this.router.url.startsWith('/admin');
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;

    if (currentY < 180) {
      this.showBackToTop = false;
      this.lastScrollY = currentY;
      return;
    }

    this.showBackToTop = currentY > this.lastScrollY;
    this.lastScrollY = currentY;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
