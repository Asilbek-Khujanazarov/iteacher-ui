import { Component, Input, OnDestroy } from '@angular/core';

import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  template: `
    <div
      class="notification"
      [class.success]="type === 'success'"
      [class.error]="type === 'error'"
    >
      <div class="notification-content">
        <i
          [class]="
            type === 'success'
              ? 'ri-checkbox-circle-line'
              : 'ri-error-warning-line'
          "
        ></i>
        <span>{{ message }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 300px;
        max-width: 400px;
      }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .notification i {
        font-size: 20px;
      }

      .success {
        background-color: #4caf50;
      }

      .error {
        background-color: #f44336;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes slideInMobile {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOutMobile {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100%);
          opacity: 0;
        }
      }

      @media (max-width: 600px) {
        .notification {
          top: 20px;
          bottom: auto;
          left: 20px;
          right: 20px;
          min-width: auto;
          max-width: none;
          width: calc(100% - 40px);
          animation: slideInMobile 0.3s ease-out;
        }

        .notification-content {
          justify-content: center;
          text-align: center;
        }

        .notification i {
          font-size: 24px;
        }
      }
    `,
  ],
})
export class NotificationComponent implements OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  private destroy$ = new Subject<void>();

  ngOnInit() {
    timer(2000) // 1 sekund ikkala versiyada ham
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const element = document.querySelector('.notification') as HTMLElement;
        if (element) {
          const isMobile = window.innerWidth <= 600;
          element.style.animation = isMobile
            ? 'slideOutMobile 0.3s ease-out forwards'
            : 'slideOut 0.3s ease-out forwards';
          setTimeout(() => element.remove(), 300);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
