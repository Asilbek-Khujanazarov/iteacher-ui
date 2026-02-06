import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  HostListener,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, PhoneFormatPipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  user: any = null;
  private authSubscription: Subscription;
  private userSubscription: Subscription;
  private isBrowser: boolean;
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isLoggedIn = isAuthenticated;
      },
    );
    this.userSubscription = this.authService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit() {
    if (this.isBrowser) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.authService.setUser(JSON.parse(userStr));
      }
      // Dark mode init
      const dark = localStorage.getItem('theme');
      this.isDarkMode = dark === 'dark';
      this.applyDarkMode();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isBrowser) {
      document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isBrowser && window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  logout() {
    this.authService.logout();
    this.closeDropdown();
    this.closeMobileMenu();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyDarkMode();
  }

  applyDarkMode() {
    if (this.isBrowser) {
      const root = document.documentElement;
      if (this.isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }
}
