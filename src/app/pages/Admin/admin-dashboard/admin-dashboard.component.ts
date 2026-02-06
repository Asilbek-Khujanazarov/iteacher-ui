import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuestionComponent } from '../question/create-question.component';
import { ManagementQuestionComponent } from '../question-management/question-management.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CreateQuestionComponent, ManagementQuestionComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  activeSection: string | null = null;
  isSidebarOpen: boolean = false;
  isDesktop: boolean = false;
  isDarkMode: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadTheme();
  }

  checkScreenSize() {
    this.isDesktop = window.innerWidth >= 768;
    if (this.isDesktop && this.isSidebarOpen) {
      this.isSidebarOpen = false; // Close sidebar on desktop resize
    }
  }

  setActiveSection(section: string, event: Event) {
    event.preventDefault();
    this.activeSection = section;
    if (!this.isDesktop) {
      this.isSidebarOpen = false; // Close sidebar after selection on mobile
    }
  }

  toggleSidebar() {
    if (!this.isDesktop) {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode =
      savedTheme === 'dark' ||
      (!savedTheme &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
